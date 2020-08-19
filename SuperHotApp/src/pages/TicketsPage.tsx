import React from 'react';
import {
  Text,
  View,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
  DeviceEventEmitter,
  EmitterSubscription,
} from 'react-native';
import {TrendingPageProps, PageNames} from '../routes-defination';
import {SafeAreaView} from 'react-native-safe-area-context';
import {WingBlank} from '@ant-design/react-native';
import {UChain, UChainEndpoints, TxInfo} from 'react-native-ultrain-sdk';
import {
  AccountsSetting,
  CurrentContractAccount,
  CurrentUsedChain,
  AccountPicker,
} from './AccountSetting';

export interface TicketInfo {
  id: number;
  title: string;
  'highest-price': number;
  rebate: number;
  commission: number;
  'transfer-count': number;

  owner: string;
  'previous-owner': string;
}

interface TrendingPageStates {
  data: TicketInfo[];
  owner: string;
  refreshing: boolean;
}

export default class TrendingPage extends React.Component<
  TrendingPageProps,
  TrendingPageStates
> {
  flatList?: FlatList;
  updateListener?: EmitterSubscription;
  // flatListPosition: number = 0;

  constructor(props: TrendingPageProps) {
    super(props);

    this.state = {
      data: [],
      owner: '',
      refreshing: false,
    };
  }

  onSearch(text: string) {
    let queryParams: TxInfo = {
      contract: CurrentContractAccount,
      action: 'balanceOf',
      account: CurrentContractAccount,
      privateKey: AccountsSetting[CurrentContractAccount],
      permissionLevel: 'active',
      params: {
        owner: text,
      },
    };

    this.setState({refreshing: true});
    UChain.pushTransaction(CurrentUsedChain, queryParams)
      .then((response: any) => {
        let data = JSON.parse(
          response.processed.action_traces[0].return_value,
        ) as TicketInfo[];
        console.log('response: ', JSON.stringify(data, undefined, 2));
        this.setState({data, refreshing: false});
      })
      .catch((e) => {
        console.log('exception: ', e);
        this.setState({refreshing: false});
      });
  }

  onSubmitSearch(e: NativeSyntheticEvent<TextInputSubmitEditingEventData>) {
    this.onSearch(e.nativeEvent.text);
  }

  UNSAFE_componentWillMount() {
    // this.onSearch('tom');
    this.updateListener = DeviceEventEmitter.addListener(
      'UpdateTicketInfo',
      (data: string[]) => {
        console.log('update event; ', data);
        if (data?.length > 0 && data[0] === this.state.owner) {
          this.onSearch(this.state.owner);
        }
      },
    );
  }

  componentWillUnmount() {
    this.updateListener?.remove();
  }

  private renderItem = (item: TicketInfo) => {
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.navigation.navigate(PageNames.Details, {
            ticket: item,
          });
        }}
        style={styles.itemContainer}>
        <View style={styles.itemHeaderContainer}>
          <View
            style={{
              flexWrap: 'wrap',
              flexDirection: 'row',
              marginTop: 5,
              justifyContent: 'space-around',
            }}>
            <Text>{`ID: ${item.id}`}</Text>
            <Text>{`转手次数: ${item['transfer-count']}`}</Text>
            <Text>{`持有人: ${item.owner}`}</Text>
            <Text>{`来自于: ${item['previous-owner']}`}</Text>
          </View>
          <View
            style={{
              marginTop: 10,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <Text style={{fontStyle: 'italic', fontSize: 25}}>
              {item.title}
            </Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              marginTop: 10,
              marginBottom: 5,
              justifyContent: 'space-around',
              alignItems: 'center',
            }}>
            <Text>{`最高价: ${item['highest-price']}`}</Text>
            <Text>{`折扣: ${item.rebate}%`}</Text>
            <Text>{`抽成: ${item.commission}%`}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <WingBlank size={'md'}>
          <View style={styles.searchBox}>
            <Image
              source={require('../images/icon-search-enabled.png')}
              style={styles.searchIcon}
            />
            {/* <TextInput
              ref={(r) => (this.searchBox = r!)}
              style={styles.inputText}
              keyboardType={'ascii-capable'}
              autoCapitalize={'none'} //设置首字母不自动大写
              autoCorrect={false}
              maxLength={12}
              underlineColorAndroid={'transparent'} //下划线颜色设置为透明
              placeholderTextColor={'#aaa'} //设置占位符颜色
              placeholder={'输入ultrain账号来搜索'}
              // onChangeText={(text) => this.onSearch(text)}
              onSubmitEditing={(e) => this.onSubmitSearch(e)}
              returnKeyType={'search'}
            /> */}
            <AccountPicker
              selectedValue={this.state.owner}
              onItemChange={(v) => {
                this.onSearch(v);
                this.setState({owner: v});
              }}
            />
          </View>
          <FlatList
            style={{marginTop: 5, marginBottom: 60}}
            contentContainerStyle={{flexGrow: 1}}
            ref={(r) => (this.flatList = r!)}
            initialNumToRender={8}
            data={this.state.data}
            renderItem={({item}) => this.renderItem(item)}
            keyExtractor={(item, index) => {
              return index.toString();
            }}
            refreshing={this.state.refreshing}
            onRefresh={() => this.onSearch(this.state.owner)}
          />
        </WingBlank>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    // width: Dimensions.get('window').width,
    // height: Dimensions.get('window').height,
    backgroundColor: '#0a0500',
    flex: 1,
  },
  searchBox: {
    flexDirection: 'row',
    // height: 40,
    marginBottom: 5,
    marginTop: 5,
    borderBottomWidth: 1,
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    backgroundColor: '#E6E7E8',
    borderRadius: 5,
  },
  searchIcon: {
    alignSelf: 'center',
    marginLeft: 7,
    marginRight: 7,
    width: 25,
    height: 25,
  },
  inputText: {
    flex: 1,
    // alignSelf: 'center',
    // marginTop: 0,
    // height: 30,
    marginLeft: 5,
    marginRight: 5,
    fontSize: 15,
    fontWeight: 'bold',
    // textAlignVertical: 'center',
    // textDecorationLine: 'none',
    // backgroundColor: 'red',
  },
  clearIcon: {
    alignSelf: 'center',
    padding: 15,
    marginRight: 7,
    width: 25,
    height: 25,
  },
  itemContainer: {
    flex: 1,
    marginTop: 15,
    backgroundColor: 'grey',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    borderRadius: 8,
    textAlign: 'center',
  },
  itemHeaderContainer: {
    flex: 1,
    flexDirection: 'column',
    // height: 60,
    // alignItems: 'flex-start',
    // justifyContent: 'space-between',
  },
  itemHeaderTitle: {
    position: 'absolute',
    fontSize: 45,
    fontWeight: 'bold',
    fontStyle: 'italic',
    color: '#bbbb08',
    left: 10,
  },
  itemHeaderCurrentContainer: {
    position: 'absolute',
    flexDirection: 'column',
    alignItems: 'flex-end',
    right: 10,
  },
  itemHeaderCurrentText: {
    fontSize: 20,
    color: '#bbbb08',
    marginLeft: 10,
    marginTop: 10,
  },
  itemContentContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 5,
  },
  itemContentGrid: {
    flex: 1,
    // borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  itemContentGridHolder: {
    flex: 1,
    // borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  itemContentGridTextUp: {
    color: '#51bb0b',
    fontSize: 25,
  },
  itemContentGridTextDown: {
    color: '#51bb0b',
    fontSize: 20,
  },
});
