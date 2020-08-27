import { Contract } from 'ultrain-ts-lib/src/contract';
import { RNAME, NAME, Account } from 'ultrain-ts-lib/src/account';
import { Asset } from 'ultrain-ts-lib/src/asset';
import { Action } from 'ultrain-ts-lib/src/action';
import { JSON } from 'ultrain-ts-lib/src/json';
import { intToString } from 'ultrain-ts-lib/src/utils';
import { Log } from 'ultrain-ts-lib/src/log';
import { now } from 'ultrain-ts-lib/src/time';

const SupplyTable = 'stat';
const TicketsTable = 'ticket2';

class IssueParams implements Serializable {
  showName: string; //演出名称
  showPlace: string; //演出地点
  showTime: string; // 演出时间
  issueTime: string;// 发行时间
  issueAmount: u64;// 发行数量
  highestPrice: u64; // 最高允许售价
  lowestPrice: u64; // 最低允许售价
  maxTransferCount: u64; // 最多允许转手次数
  transRebates: u8[]; // 转手抽成比例

  constructor() {
    this.showName = '';
    this.showPlace= '';
    this.showTime = '';
    this.issueTime = '';
    this.issueAmount = 0;
    this.highestPrice = 0;
    this.lowestPrice = 0;
    this.maxTransferCount = 0;
    this.transRebates = [];
  }

  primaryKey(): u64 { return 0; }
}

class IssuedIds implements Serializable {
  iids: u64[];

  constructor() {
    this.iids = [];
  }

  static add(id: u64): void {
    let db = new DBManager<IssuedIds>(NAME('sii.ids'), NAME('sii.ids'));
    let iids = new IssuedIds();
    let existing = db.get(0, iids);
    iids.iids.push(id);
    if (existing) {
      db.modify(iids);
    } else {
      db.emplace(iids);
    }
  }

  static read(): u64[] {
    let db = new DBManager<IssuedIds>(NAME('sii.ids'), NAME('sii.ids'));
    let iids = new IssuedIds();
    let existing = db.get(0, iids);
    return existing ? iids.iids : [];
  }

  primaryKey(): u64 { return 0; }
}

class SavedIssueInfo implements Serializable, Returnable {
  @primaryid
  id: u64;
  issueParmas: IssueParams;
  availableNfts: u64[]; // 可以发行的NFT

  constructor() {
    this.id = 0;
    this.issueParmas = new IssueParams();
    this.availableNfts = [];
  }

  nftIds(): string {
    let s = '[';
    for (let i = 0; i < this.availableNfts.length; i++) {
      s += intToString(this.availableNfts[i]);
      if (i < this.availableNfts.length - 1) {
        s += ',';
      }
    }
    s += ']';
    return s;
  }

  toString(): string {
    let json = new JSON();
    json.item<u64>('issueId', this.id);
    json.item<string>('issueParams', this.issueParmas.toString());
    json.item<string>('availalbeNfts', this.nftIds());
    return json.toString();
  }

  private static SIIDB(): DBManager<SavedIssueInfo> {
    return new DBManager<SavedIssueInfo>(NAME('sii'), NAME('sii'));
  }

  private static NftIdPrefix(): u64 {

      let nft: u64 = 0xA000000000000000;
      let ti: u64 = (<u64>now() << 28);
      return nft + ti;
  }

  static add(param: IssueParams): SavedIssueInfo {
    let sii = new SavedIssueInfo();
    sii.id = U64IdGenerator.nextId();
    sii.issueParmas = param;
    let idprefix = SavedIssueInfo.NftIdPrefix();
    for (let i = 0; i < param.issueAmount; ++i) {
      sii.availableNfts.push(idprefix + i);
    }

    let db = SavedIssueInfo.SIIDB();
    db.emplace(sii);

    IssuedIds.add(sii.id);

    return sii;
  }

  static query(id: u64): SavedIssueInfo {
    let sii = new SavedIssueInfo();
    let db = SavedIssueInfo.SIIDB();
    let existing = db.get(id, sii);
    ultrain_assert(existing, 'issue id ' + intToString(id) + ' is not exist.');
    return sii;
  }

  static allIds(): u64[] {
    return IssuedIds.read();
  }
}

class TicketTransferRecord  implements Serializable, Returnable {
  ticketPrice: u64; // 票价

  buyerFee: u64; // 买方手续费
  buyerPaied: u64; // 买方实付金额

  sellerFee: u64; // 卖方手续费
  sellerIncoming: u64; // 卖方实际收入

  sellerAccount: string; // 卖方账号
  buyerAccount: string; // 买方账号

  time: string; // 交易时间
  status: string; // 交易状态
  txId: string; // 交易id

  constructor() {
    this.ticketPrice = 0;
    this.buyerFee = 0;
    this.buyerPaied = 0;
    this.sellerFee = 0;
    this.sellerIncoming = 0;
    this.sellerAccount = '';
    this.buyerAccount = '';
    this.time = '';
    this.status = '';
    this.txId = '';
  }

  toString(): string {
    let json = new JSON();
    json.item<u64>('ticketPrice', this.ticketPrice);
    json.item<u64>('buyerFee', this.buyerFee);
    json.item<u64>('buyerPaied', this.buyerPaied);
    json.item<u64>('sellerFee', this.sellerFee);
    json.item<u64>('sellerIncoming', this.sellerIncoming);
    json.item<string>('buyer', this.buyerAccount);
    json.item<string>('seller', this.sellerAccount);
    json.item<string>('time', this.time);
    json.item<string>('status', this.status);
    json.item<string>('txId', this.txId);
    return json.toString();
  }

  primaryKey(): u64 { return 0; }
}

class TicketFirstSell implements Serializable, Returnable {
  price: u64; // 交易金额
  platformFee: u64; // 平台手续费
  sellerIncoming: u64; // 卖方收入
  seller: string; // 卖方账号
  buyer: string; // 买方账号
  time: string; // 时间
  status: string; // 状态
  txId: string;

  constructor() {
    this.price = 0;
    this.platformFee = 0;
    this.sellerIncoming = 0;
    this.seller = '';
    this.buyer = '';
    this.time = '';
    this.status = '';
    this.txId = '';
  }

  toString(): string {
    let json = new JSON();
    json.item<u64>('price', this.price);
    json.item<u64>('platformFee', this.platformFee);
    json.item<u64>('sellerIncoming', this.sellerIncoming);
    json.item<string>('seller', this.seller);
    json.item<string>('buyer', this.buyer);
    json.item<string>('time', this.time);
    json.item<string>('status', this.status);
    json.item<string>('txId', this.txId);
    return json.toString();
  }

  primaryKey(): u64 {
    return 0;
  }
}

class Ticket implements Serializable, Returnable {
  @primaryid
  nft: u64; // 票的Nft编号
  issueId: u64; // 发行id

  showName: string;
  showPlace: string;

  firstSell: TicketFirstSell;
  transferRecord: TicketTransferRecord[];

  constructor() {
    this.nft= 0;
    this.issueId= 0;
    this.showName = '';
    this.showPlace = '';
    this.firstSell = new TicketFirstSell();
    this.transferRecord = [];
  }

  transferRecordString(): string {
    let s = '[';
    for (let i = 0; i < this.transferRecord.length; ++i) {
      s += this.transferRecord[i].toString();
      if (i < this.transferRecord.length - 1)
      s += ','
    }
    s += ']';

    return s;
  }

  toString(): string {
    let json = new JSON();
    json.item<u64>('nft', this.nft);
    json.item<u64>('issueId', this.issueId);
    json.item<string>('showName', this.showName);
    json.item<string>('showPlace', this.showPlace);
    json.item<string>('firstSell', this.firstSell.toString());
    json.item<string>('transferRecord', this.transferRecordString());
    return json.toString();
  }

  private static TicketsDbManager(): DBManager<Ticket> {
    return new DBManager<Ticket>(NAME(TicketsTable), NAME(TicketsTable));
  }

  static issue(ticket: Ticket): void {
    let db = Ticket.TicketsDbManager();
    db.emplace(ticket);
  }

  static transfer(nft: u64, transferRecord: TicketTransferRecord): void {
    let db = Ticket.TicketsDbManager();
    let ticket = new Ticket();
    let existing = db.get(nft, ticket);
    ultrain_assert(existing, 'nft ' + intToString(nft) + ' is not exist.');

    let sid = ticket.issueId;
    let sii = SavedIssueInfo.query(sid);
    ultrain_assert(sii.issueParmas.maxTransferCount > ticket.transferRecord.length, 'Can not transfer this ticket, reach max transfer count.');

    ticket.transferRecord.push(transferRecord);
    db.modify(ticket);
  }

  static firstSell(nft: u64, sellInfo: TicketFirstSell): void {
    let db = Ticket.TicketsDbManager();
    let ticket = new Ticket();
    let existing = db.get(nft, ticket);
    ultrain_assert(existing, 'nft ' + intToString(nft) + ' not exist.');

    ticket.firstSell = sellInfo;
    db.modify(ticket);
  }

  static query(nft: u64): Ticket {
    let db = Ticket.TicketsDbManager();
    let t = new Ticket();
    let existing = db.get(nft, t);
    ultrain_assert(existing, 'nft ' + intToString(nft) + ' is not exist.');
    return t;
  }
}

class U64IdGenerator implements Serializable {
  index: u64;
  constructor() {
    this.index = 0;
  }

  primaryKey(): u64 {
    return 0;
  }

  static nextId(): u64 {
    let tiddb = new DBManager<U64IdGenerator>(NAME('ticket.id'), NAME('ticket.id'));
    let tid = new U64IdGenerator();
    let existing = tiddb.get(0, tid);
    tid.index = tid.index + 1;

    if (existing) {
      tiddb.modify(tid);
    } else {
      tiddb.emplace(tid);
    }
    return tid.index;
  }
}

@database(Ticket, TicketsTable)
class MyContract extends Contract {
  @action
  issueTickets(issueInfo: IssueParams): u64 {
    Action.requireAuth(this.receiver);
    let sii = SavedIssueInfo.add(issueInfo);

    for (let i = 0; i < sii.availableNfts.length; ++i) {
      let ticket = new Ticket();
      ticket.nft = sii.availableNfts[i];
      ticket.issueId = sii.id;
      ticket.showName = sii.issueParmas.showName;
      ticket.showPlace = sii.issueParmas.showPlace;

      Ticket.issue(ticket);
    }
    return sii.id;
  }

  @action
  firstSellTicket(nft: u64, sellinfo: TicketFirstSell): void {
    Action.requireAuth(this.receiver);
    Ticket.firstSell(nft, sellinfo);
  }

  @action
  transferTicket(nft: u64, ticket: TicketTransferRecord): void {
    Action.requireAuth(this.receiver);
    Ticket.transfer(nft, ticket);
  }

  @action("pureview")
  issuedIds(): u64[] {
    return SavedIssueInfo.allIds();
  }

  @action("pureview")
  issueInfo(issueId: u64): SavedIssueInfo {
    let sii = SavedIssueInfo.query(issueId);
    return sii;
  }

  @action("pureview")
  ticketInfo(nft: u64): Ticket {
    let t = Ticket.query(nft);
    return t;
  }
}
