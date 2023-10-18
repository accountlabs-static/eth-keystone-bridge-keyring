import fetchTransport, {
  isSupported, getKeystoneDevices,
} from '@keystonehq/hw-transport-webusb';
import Eth, { HDPathType } from '@keystonehq/hw-app-eth';

interface IData {
  target: string;
  action: string;
  payload: any;
}

interface IResponse {
  success: boolean;
  payload: any;
}

let hdInstance: Eth | null = null;

const isSupportUSB = async () => isSupported().catch(() => false);

const initHDInstanceIfNeed = async () => {
  try {
    await isSupportUSB();
    if (!hdInstance) {
      // const transport = await fetchTransport();
      const devices = await getKeystoneDevices();
      debugger
      return;
      const eth = new Eth(transport);
      hdInstance = eth;
    }
  } catch (err) {
    throw err;
  }
}

const getAddressesFromHD = async (type: HDPathType = HDPathType.Bip44Standard) => {
  await initHDInstanceIfNeed();
  const addresses = await hdInstance!.exportAddress({
    type,
  });
  return addresses;
}

const signTransactionFromHD = async (ur: string) => {
  await initHDInstanceIfNeed();
  return await hdInstance!.signTransactionFromUr(ur);
}

export const requestHandler = async (event: MessageEvent<IData>) => {
  if (event.data?.target === 'rabby-keystone') {
    try {
      const response: IResponse = {
        success: true,
        payload: '',
      };
      switch (event.data.action) {
        case 'GET_ADDRESS_FROM_HD': {
          const result = await getAddressesFromHD(event.data?.payload);
          response.payload = result;
          break;
        }
        case 'SIGN_TRANSACTION_FROM_HD': {
          const result = await signTransactionFromHD(event.data?.payload);
          response.payload = result;
          break;
        }
        default:
          break;
      }

      event.source?.postMessage(response, event.origin as any);
    } catch (error: any) {
      event.source?.postMessage({
        success: false,
        payload: error?.message ?? 'Unknown error',
      }, event.origin as any);
    }
  }
}