import React, {useState} from 'react';
import {DetailsPageProps} from '../src/routes-defination';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  TextInput,
  Button,
  KeyboardAvoidingView,
  DeviceEventEmitter,
} from 'react-native';
import {TicketInfo} from './TicketsPage';
import {WingBlank} from '@ant-design/react-native';
import {UChain, TxInfo} from '../../react-native-ultrain-sdk';
import {
  CurrentUsedChain,
  CurrentContractAccount,
  AccountsSetting,
  ToastMessage,
  AccountPicker,
} from './AccountSetting';
import {Picker} from '@react-native-community/picker';

const TicketInfoItem: React.FC<{ticket: TicketInfo}> = ({ticket}) => {
  return (
    <View
      style={[
        {
          flexDirection: 'column',
        },
        styles.item,
      ]}>
      <View
        style={{
          flexWrap: 'wrap',
          flexDirection: 'row',
          marginTop: 5,
          justifyContent: 'space-around',
        }}>
        <Text>{`ID: ${ticket.id}`}</Text>
        <Text>{`转手次数: ${ticket['transfer-count']}`}</Text>
        <Text>{`持有人: ${ticket.owner}`}</Text>
        <Text>{`来自于: ${ticket['previous-owner']}`}</Text>
      </View>
      <View
        style={{
          marginTop: 10,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Text style={{fontStyle: 'italic', fontSize: 25}}>{ticket.title}</Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          marginTop: 10,
          marginBottom: 5,
          justifyContent: 'space-around',
          alignItems: 'center',
        }}>
        <Text>{`最高价: ${ticket['highest-price']}`}</Text>
        <Text>{`折扣: ${ticket.rebate}%`}</Text>
        <Text>{`抽成: ${ticket.commission}%`}</Text>
      </View>
    </View>
  );
};

const TransferItem: React.FC<{onTranferPressed: (text: string) => void}> = ({
  onTranferPressed,
}) => {
  const [acceptor, setAcceptor] = useState('');
  return (
    <View
      style={[
        styles.item,
        {flexDirection: 'column', justifyContent: 'flex-start', marginTop: 10},
      ]}>
      <Text style={{marginTop: 5, color: 'yellow'}}>转让给其它人</Text>
      <View
        style={{
          flexDirection: 'row',
          marginTop: 5,
          justifyContent: 'flex-start',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: '#aaa',
        }}>
        <Text>接收者账号: </Text>
        <AccountPicker
          onItemChange={(v) => setAcceptor(v)}
          selectedValue={acceptor}
        />
        <Button title={'  转让  '} onPress={() => onTranferPressed(acceptor)} />
      </View>
    </View>
  );
};

interface UpdateTicketInfo {
  title: string;
  price: number;
  rebate: number;
  commission: number;
}

const InputItem: React.FC<{
  label: string;
  keyboardType: string;
  originValue: string;
  onChangeText: (text: string) => void;
}> = ({label, keyboardType, originValue, onChangeText}) => {
  return (
    <View
      style={{
        flexDirection: 'row',
        marginTop: 5,
        justifyContent: 'flex-start',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#aaa',
      }}>
      <Text>{label} </Text>
      <TextInput
        key={originValue}
        style={{flex: 1, backgroundColor: '#787860'}}
        keyboardType={keyboardType}
        autoCapitalize={'none'} //设置首字母不自动大写
        autoCorrect={false}
        // autoFocus={true}
        // maxLength={12}
        underlineColorAndroid={'transparent'} //下划线颜色设置为透明
        // placeholderTextColor={'#aaa'} //设置占位符颜色
        // placeholder={placeHolder}
        onChangeText={(text) => onChangeText(text)}
        defaultValue={originValue}
        // value={originValue}
        returnKeyType={'default'}
      />
    </View>
  );
};

interface DetailPageStates {
  ticket: TicketInfo;
  title: string;
  price: string;
  rebate: string;
  commission: string;
}

export default class DetailPage extends React.Component<
  DetailsPageProps,
  DetailPageStates
> {
  constructor(props: DetailsPageProps) {
    super(props);
    let ticket: TicketInfo = this.props.route.params.ticket;
    this.state = {
      ticket,
      title: ticket.title,
      price: ticket['highest-price'].toString(),
      rebate: ticket.rebate.toString(),
      commission: ticket.commission.toString(),
    };
  }
  UNSAFE_componentWillMount() {
    this.setState({ticket: this.props.route.params.ticket});
  }

  repullInfo() {
    const do_query = () => {
      let queryParams: TxInfo = {
        contract: CurrentContractAccount,
        action: 'detailsOf',
        account: CurrentContractAccount,
        privateKey: AccountsSetting[CurrentContractAccount],
        permissionLevel: 'active',
        params: {
          ticketIds: [this.state.ticket.id],
        },
      };

      UChain.pushTransaction(CurrentUsedChain, queryParams)
        .then((response: any) => {
          let data = JSON.parse(
            response.processed.action_traces[0].return_value,
          ) as TicketInfo[];
          if (data.length !== 0) {
            this.setState({ticket: data[0]});
          }
        })
        .catch((e) => {
          console.log('exception: ', e);
        });
    };

    setTimeout(do_query, 200);
  }

  transfer(acceptor: string) {
    console.log('transfer to: ', acceptor);
    const owner = this.state.ticket.owner;

    if (acceptor.length === 0) {
      ToastMessage('请选择接收账号.');
      return;
    }
    if (owner === acceptor) {
      ToastMessage('不能自己转给自己.');
      return;
    }

    let transferParams: TxInfo = {
      contract: CurrentContractAccount,
      action: 'transfer',
      account: owner,
      privateKey: AccountsSetting[owner],
      permissionLevel: 'active',
      params: {
        from: owner,
        to: acceptor,
        tokenIds: [this.state.ticket.id],
        memo: '转让给某人',
      },
    };
    UChain.pushTransaction(CurrentUsedChain, transferParams)
      .then((response: any) => {
        this.repullInfo();
        ToastMessage('转让成功');
        DeviceEventEmitter.emit('UpdateTicketInfo', [owner]);
      })
      .catch((e) => {
        console.log('exception: ', e);
        ToastMessage('转让失败: ' + e.message);
      });
  }

  update(info: UpdateTicketInfo) {
    let owner = this.state.ticket.owner;
    let updateParams: TxInfo = {
      contract: CurrentContractAccount,
      action: 'setTicketInfo',
      account: owner,
      privateKey: AccountsSetting[owner],
      permissionLevel: 'active',
      params: {
        ticket: {
          id: this.state.ticket.id,
          title: info.title,
          highestPrice: info.price,
          rebate: info.rebate,
          commission: info.commission,
        },
      },
    };
    UChain.pushTransaction(CurrentUsedChain, updateParams)
      .then((response: any) => {
        this.repullInfo();
        ToastMessage('更新成功');
      })
      .catch((e) => {
        console.log('exception: ', e);
        ToastMessage('更新失败: ' + e.message);
      });
  }

  render() {
    const ticket = this.state.ticket;
    return (
      <SafeAreaView style={styles.container}>
        <WingBlank size={'md'}>
          <KeyboardAvoidingView
            behavior={'position'}
            keyboardVerticalOffset={80}>
            <TicketInfoItem ticket={this.state.ticket} />
            <TransferItem
              onTranferPressed={(acceptor) => this.transfer(acceptor)}
            />
            <View
              style={[
                styles.item,
                {
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  marginTop: 8,
                },
              ]}>
              <Text style={{marginTop: 5, color: 'yellow'}}>更新信息</Text>
              <InputItem
                label={'标题: '}
                keyboardType={'ascii-capable'}
                originValue={ticket.title}
                onChangeText={(text) => this.setState({title: text})}
                // onChangeText={(text) => (title = text)}
              />

              <InputItem
                label={'最高价: '}
                keyboardType={'decimal-pad'}
                originValue={ticket['highest-price'].toString()}
                onChangeText={(text) => this.setState({price: text})}
              />

              <InputItem
                label={'折扣: '}
                keyboardType={'decimal-pad'}
                originValue={ticket.rebate.toString()}
                onChangeText={(text) => this.setState({rebate: text})}
              />

              <InputItem
                label={'抽成: '}
                keyboardType={'decimal-pad'}
                originValue={ticket.commission.toString()}
                onChangeText={(text) => this.setState({commission: text})}
              />

              <View style={{marginTop: 5, marginBottom: 8}}>
                <Button
                  title={'  更新  '}
                  onPress={() =>
                    this.update({
                      title: this.state.title,
                      price: parseInt(this.state.price, 10),
                      rebate: parseInt(this.state.rebate, 10),
                      commission: parseInt(this.state.commission, 10),
                    })
                  }
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </WingBlank>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
    backgroundColor: '#0a0500',
    flex: 1,
  },
  item: {
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    backgroundColor: 'grey',
  },
});
