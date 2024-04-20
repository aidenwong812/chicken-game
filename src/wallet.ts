import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";

const WalletConnection = async () => {
  const { solana } = window as any;
  if (!solana) {
    window.open("https://phantom.app/", "_blank");
  }

  try {
    const phantom = new PhantomWalletAdapter();
    await phantom.connect();
    const wallet = {
      address: phantom.publicKey,
    };

    if (wallet.address) {
      return wallet.address
    }
    return ""
  } catch (err) {
    console.log(err)
    return ""
  }
};

export default WalletConnection