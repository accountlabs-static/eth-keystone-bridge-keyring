import fetchTransport, {
  isSupported,
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
  await isSupportUSB();
  if (!hdInstance) {
    const transport = await fetchTransport();
    const eth = new Eth(transport);
    hdInstance = eth;
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
    const response: IResponse = {
      success: false,
      payload: 'unknown action',
    };
    switch (event.data.action) {
      case 'GET_ADDRESS_FROM_HD': {
        const result = await getAddressesFromHD(event.data?.payload).catch((err) => {
          response.payload = err?.message;
        });
        response.success = true;
        response.payload = result;
        break;
      }
      case 'SIGN_TRANSACTION_FROM_HD': {
        const result = await signTransactionFromHD(event.data?.payload).catch((err) => {
          response.payload = err?.message;
        });
        response.success = true;
        response.payload = result;
        break;
      }
      default:
        break;
    }

    event.source?.postMessage(response, event.origin as any);
  }
}