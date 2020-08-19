import React, {useState} from 'react';
import {MyPageProps} from '../routes-defination';
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
  ToastAndroid,
  DeviceEventEmitter,
} from 'react-native';
import {TicketInfo} from './TicketsPage';
import {WingBlank, Toast} from '@ant-design/react-native';
import {UChain, TxInfo} from '../../react-native-ultrain-sdk';
import {
  CurrentUsedChain,
  CurrentContractAccount,
  AccountsSetting,
  ToastMessage,
  AccountPicker,
} from './AccountSetting';

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
        <TextInput
          style={{flex: 1}}
          keyboardType={'ascii-capable'}
          autoCapitalize={'none'} //设置首字母不自动大写
          autoCorrect={false}
          maxLength={12}
          underlineColorAndroid={'transparent'} //下划线颜色设置为透明
          placeholderTextColor={'#aaa'} //设置占位符颜色
          placeholder={'输入接收者账号'}
          onChangeText={(text) => setAcceptor(text)}
          onSubmitEditing={(e) => onTranferPressed(e.nativeEvent.text)}
          returnKeyType={'search'}
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

interface MyPageStates {
  to: string;
  title: string;
  price: string;
  rebate: string;
  commission: string;
}

export default class MyPage extends React.Component<MyPageProps, MyPageStates> {
  constructor(props: MyPageProps) {
    super(props);
    this.state = {
      to: '',
      title: '',
      price: '',
      rebate: '',
      commission: '',
    };
  }

  issue() {
    let issueParams: TxInfo = {
      contract: CurrentContractAccount,
      action: 'issue',
      account: CurrentContractAccount,
      privateKey: AccountsSetting[CurrentContractAccount],
      permissionLevel: 'active',
      params: {
        to: this.state.to,
        tickets: [
          {
            id: 0,
            title: this.state.title,
            highestPrice: parseInt(this.state.price, 10),
            rebate: parseInt(this.state.rebate, 10),
            commission: parseInt(this.state.commission, 10),
          },
        ],
      },
    };
    UChain.pushTransaction(CurrentUsedChain, issueParams)
      .then((response: any) => {
        ToastMessage('发行成功');
        DeviceEventEmitter.emit('UpdateTicketInfo', [this.state.to]);
      })
      .catch((e) => {
        console.log('exception: ', e);
        ToastMessage('发行失败: ' + e.message);
      });
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <WingBlank size={'md'}>
          <KeyboardAvoidingView
            behavior={'position'}
            keyboardVerticalOffset={80}>
            <View
              style={[
                styles.item,
                {
                  flexDirection: 'column',
                  justifyContent: 'flex-start',
                  marginTop: 8,
                },
              ]}>
              <Text style={{marginTop: 5, color: 'yellow'}}>票务发行</Text>
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
                  onItemChange={(v) => this.setState({to: v})}
                  selectedValue={this.state.to}
                />
              </View>
              {/* <InputItem
                label={'接收者账号: '}
                keyboardType={'ascii-capable'}
                originValue={''}
                onChangeText={(text) => this.setState({to: text})}
              /> */}
              <InputItem
                label={'标题: '}
                keyboardType={'ascii-capable'}
                originValue={''}
                onChangeText={(text) => this.setState({title: text})}
              />

              <InputItem
                label={'最高价: '}
                keyboardType={'decimal-pad'}
                originValue={''}
                onChangeText={(text) => this.setState({price: text})}
              />

              <InputItem
                label={'折扣: '}
                keyboardType={'decimal-pad'}
                originValue={''}
                onChangeText={(text) => this.setState({rebate: text})}
              />

              <InputItem
                label={'抽成: '}
                keyboardType={'decimal-pad'}
                originValue={''}
                onChangeText={(text) => this.setState({commission: text})}
              />

              <View style={{marginTop: 5, marginBottom: 8}}>
                <Button title={'  发行票据  '} onPress={() => this.issue()} />
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
