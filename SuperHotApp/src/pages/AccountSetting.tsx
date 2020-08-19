import React, {useState} from 'react';
import {UChainEndpoints} from 'react-native-ultrain-sdk';
import {ToastAndroid, View} from 'react-native';
import {Picker} from '@react-native-community/picker';

export interface PrivateKeyOfAccount {
  [account: string]: string;
}

const LocalTestAccountSetting: PrivateKeyOfAccount = {
  jack: '5J5Grit1vSJ5u5ch52zwAA9BuMpsuYEZxww3nQQDN9tDjRUifKt',
  tom: '5JaVTxDTaXfdFnca9WK2z8PgB4zLqFVAQYCR3YT7bpu52m5AUbK',
  jerry: '5Jq3GkKhV5HPzRUqAP9iZU8rQ8jPWHdjvxicqUH8q8dFX5X3Lpp',
};

const PioneerChainAccountSetting: PrivateKeyOfAccount = {
  yuanjing1: '5KfjDYSn44QfW2s9xs8NxrCPMZUh1ZbZNJG7o6PUsLNg8VbCdV4',
  yj1product: '5KiXMguP1iEBRp2raCEDR6LyvzpoFBEKrjvminuSCRCtAKjkoSz',
};

const ChainConfig = {
  local: 'http://172.16.20.111:8888', // 在android模拟器上, 10.0.2.2 代表宿主机的127.0.0.1
  pioneer: UChainEndpoints.PioneerNet,
};

export const ToastMessage = (msg: string) => {
  ToastAndroid.showWithGravityAndOffset(
    msg,
    ToastAndroid.LONG,
    ToastAndroid.CENTER,
    20,
    50,
  );
};

// export const AccountsSetting: PrivateKeyOfAccount = LocalTestAccountSetting;
// export const CurrentContractAccount = 'jack';
// export const CurrentUsedChain: UChainEndpoints = ChainConfig.local as UChainEndpoints;
export const CurrentContractAccount = 'yuanjing1';
export const AccountsSetting: PrivateKeyOfAccount = PioneerChainAccountSetting;
export const CurrentUsedChain: UChainEndpoints = ChainConfig.pioneer as UChainEndpoints;

export const AccountPicker: React.FC<{
  onItemChange: (value: string) => void;
  selectedValue: string;
  // data: string[];
}> = ({onItemChange, selectedValue}) => {
  return (
    <Picker
      selectedValue={selectedValue}
      mode={'dropdown'}
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'stretch',
        // backgroundColor: 'red',
      }}
      onValueChange={(itemValue, itemIndex) => {
        onItemChange(itemValue as string);
      }}>
      <Picker.Item label={'--请选择--'} value={''} />
      {Object.keys(AccountsSetting).map((value) => {
        return <Picker.Item label={value} value={value} />;
      })}
    </Picker>
  );
};
