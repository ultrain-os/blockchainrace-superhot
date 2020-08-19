import { Contract } from 'ultrain-ts-lib/src/contract';
import { RNAME, NAME, Account } from 'ultrain-ts-lib/src/account';
import { Asset } from 'ultrain-ts-lib/src/asset';
import { Action } from 'ultrain-ts-lib/src/action';
import { JSON } from 'ultrain-ts-lib/src/json';
import { intToString } from 'ultrain-ts-lib/src/utils';
import { Log } from 'ultrain-ts-lib/src/log';

const SupplyTable = 'stat';
const TicketsTable = 'ticket';

class SetableTicket implements Serializable {
  id: u64;
  title: string; // 票的描述
  highestPrice: u64; // 最高售价, 最后4位为小数部分
  rebate: u64;  // 折扣, 设置为一个整数, 表示百分比, 如30表示 30%
  commission: u64; // 佣金比例, 设置为一个整数, 表示百分比, 同rebate

  constructor() {
    this.id = 0;
    this.title = '';
    this.highestPrice = 0;
    this.rebate = 0;
    this.commission = 0;
  }
}

class Ticket implements Serializable, Returnable {
  @primaryid
  id: u64;
  title: string; // 票的描述
  highestPrice: u64; // 最高售价, 最后4位为小数部分
  transferCount: u64; // 转让次数
  rebate: u64;  // 折扣, 设置为一个整数, 表示百分比, 如30表示 30%
  commission: u64; // 佣金比例, 设置为一个整数, 表示百分比, 同rebate

  owner: account_name; // 拥有者
  prevOwner: account_name; // 上一个拥有者

  constructor() {
    this.id = 0;
    this.title = '';
    this.highestPrice = 0;
    this.transferCount = 0;
    this.rebate = 0;
    this.commission = 0;
    this.owner = 0;
    this.prevOwner = 0;
  }

  toString(): string {
    let json = new JSON();
    json.item<u64>('id', this.id);
    json.item<string>('title', this.title);
    json.item<u64>('highest-price', this.highestPrice);
    json.item<u64>('transfer-count', this.transferCount);
    json.item<u64>('rebate', this.rebate);
    json.item<u64>('commission', this.commission);
    json.item<string>('owner', RNAME(this.owner));
    json.item<string>('previous-owner', RNAME(this.prevOwner));
    return json.toString();
  }

  private static TicketsDbManager(): DBManager<Ticket> {
    return new DBManager<Ticket>(NAME(TicketsTable), NAME(TicketsTable));
  }

  static add(from: account_name, to: account_name, tickets: SetableTicket[]): u64[] {
    let tdb = Ticket.TicketsDbManager();
    let tids: u64[] = [];
    for (let i = 0; i < tickets.length; i++) {
      let ticket = new Ticket();
      ticket.title = tickets[i].title;
      ticket.highestPrice = tickets[i].highestPrice;
      ticket.commission = tickets[i].commission;
      ticket.rebate = tickets[i].rebate;

      ticket.id = TicketIdGenerator.nextId();
      ticket.transferCount = 0;
      ticket.owner = to;
      ticket.prevOwner = from;

      tdb.emplace(ticket);

      tids.push(ticket.id);
    }

    return tids;
  }

  static update(ticket: SetableTicket): void {
    let tdb = Ticket.TicketsDbManager();
    let storedTicket = new Ticket();
    let existing = tdb.get(ticket.id, storedTicket);
    ultrain_assert(existing, 'This ticket is not existing.');
    ultrain_assert(Action.sender === storedTicket.owner, 'you are not the owner of this ticket: ' + intToString(ticket.id));

    storedTicket.title = ticket.title;
    storedTicket.highestPrice = ticket.highestPrice;
    storedTicket.rebate = ticket.rebate;
    storedTicket.commission = ticket.commission;

    tdb.modify(storedTicket);
  }

  static transfer(from: account_name, to: account_name, tids: u64[]): u64[] {
    let db = Ticket.TicketsDbManager();
    let failedIds: u64[] = [];
    for (let i = 0; i < tids.length; ++i) {
      let ticket = new Ticket();
      let existing = db.get(tids[i], ticket);
      if (existing && ticket.owner === from) {
        ++ticket.transferCount;
        ticket.owner = to;
        ticket.prevOwner = from;
        db.modify(ticket);
      } else {
        failedIds.push(tids[i]);
      }
    }
    return failedIds;
  }

  static getTickets(tids: u64[]): Ticket[] {
    let tickets: Ticket[] = [];
    let db = Ticket.TicketsDbManager();
    for (let i = 0; i < tids.length; i++) {
      let t = new Ticket();
      let existing = db.get(tids[i], t);
      if (existing) {
        tickets.push(t);
      }
    }

    return tickets;
  }
}

class SupplyInfo implements Serializable {
  supply: Asset;
  max_supply: Asset;
  issuer: account_name;

  constructor() {
      this.max_supply = new Asset();
      this.supply = new Asset();
      this.issuer = 0;
  }

  // @ts-ignore
  newInstance(supply: Asset, max_supply: Asset, issuer: account_name): SupplyInfo {
      var stats = new SupplyInfo();
      stats.max_supply = max_supply;
      stats.supply = supply;
      stats.issuer = issuer;
  }

  primaryKey(): id_type { return this.supply.symbolName(); }

  static addIssuerInfo(issuer: account_name, maximum_supply: Asset): void {
    let statstable: DBManager<SupplyInfo> = new DBManager<SupplyInfo>(NAME(SupplyTable), NAME(SupplyTable));
    let cs: SupplyInfo = new SupplyInfo();
    let sym = maximum_supply.symbolName();
    let existing = statstable.get(sym, cs);
    ultrain_assert(!existing, "token with symbol already exists.");

    cs.supply.setSymbol(maximum_supply.getSymbol());
    cs.max_supply = maximum_supply;
    cs.issuer = issuer;
    statstable.emplace(cs);
  }
}

class TicketIdGenerator implements Serializable {
  index: u64;
  constructor() {
    this.index = 0;
  }

  primaryKey(): u64 {
    return 0;
  }

  static nextId(): u64 {
    let tiddb = new DBManager<TicketIdGenerator>(NAME('ticket.id'), NAME('ticket.id'));
    let tid = new TicketIdGenerator();
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

class OwnershipInfo implements Serializable {
  @primaryid
  owner: account_name;
  ids: u64[];

  constructor() {
    this.owner = 0;
    this.ids = [];
  }

  private static ownershipDb(): DBManager<OwnershipInfo> {
    return new DBManager<OwnershipInfo>(NAME('ownership'), NAME('ownership'));
  }

  static ticketsOf(owner: account_name): u64[] {
    let db = OwnershipInfo.ownershipDb();
    let oi = new OwnershipInfo();
    let existing = db.get(owner, oi);
    if (existing) { return oi.ids; }
    else {return []; }
  }

  static addTickets(owner: account_name, ids: u64[]): void {
    let db = OwnershipInfo.ownershipDb();
    let oi = new OwnershipInfo();
    let existing = db.get(owner, oi);

    if (existing) {
      oi.ids = oi.ids.concat(ids);
      db.modify(oi);
    } else {
      oi.owner = owner;
      oi.ids = ids;
      db.emplace(oi);

    }
  }

  static removeTickets(owner: account_name, ids: u64[]): void {
    let db = OwnershipInfo.ownershipDb();
    let oi = new OwnershipInfo();
    let existing = db.get(owner, oi);

    ultrain_assert(existing, RNAME(owner) + ' owns nothing.');

    for (let i = oi.ids.length - 1; i >= 0; i--) {
      if (ids.indexOf(oi.ids[i]) != -1) {
        oi.ids.splice(i, 1);
      }
    }

    db.modify(oi);
  }
}

@database(SupplyInfo, SupplyTable)
@database(Ticket, TicketsTable)
class MyContract extends Contract {
  // 发行方, 设置最高的发行数量
  @action
  create(issuer: account_name, maximum_supply: Asset): void {
    Action.requireAuth(this.receiver);
    ultrain_assert(maximum_supply.isSymbolValid(), "token.create: invalid symbol name.");
    ultrain_assert(maximum_supply.symbolPrecision() == 0, "token.create: symbol precision must be a whole number");
    ultrain_assert(maximum_supply.isValid(), "token.create: invalid supply.");

    SupplyInfo.addIssuerInfo(issuer, maximum_supply);
  }
  // 承销方, 最多拥有的票数
  @action
  issue(to: account_name, tickets: SetableTicket[]): void {
    Action.requireAuth(this.receiver);
    ultrain_assert(Account.isValid(to), 'Account ' + RNAME(to) + ' is not exist.');

    let tids = Ticket.add(this.receiver, to, tickets);
    OwnershipInfo.addTickets(to, tids);
  }

  // 设置票的信息
  @action
  setTicketInfo(ticket: SetableTicket): void {
    Ticket.update(ticket);
  }

  // 转让
  @action
  transfer(from: account_name, to: account_name, tokenIds: u64[], memo: string): void {
    Action.requireAuth(from);
    ultrain_assert(from !== to, 'you can not transfer to yourself.');

    OwnershipInfo.removeTickets(from, tokenIds);
    OwnershipInfo.addTickets(to, tokenIds);

    Ticket.transfer(from, to, tokenIds);
  }

  @action("pureview")
  balanceOf(owner: account_name): Ticket[] {
    let tids = OwnershipInfo.ticketsOf(owner);
    return Ticket.getTickets(tids);
  }

  @action("pureview")
  detailsOf(ticketIds: u64[]): Ticket[] {
    return Ticket.getTickets(ticketIds);
  }
}
