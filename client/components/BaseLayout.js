import { useWeb3 } from "@context/Web3Context";
import AccountAddress from "./AccountAddress";
import ConnectButton from "./ConnectButton";
import Sidebar from "./Sidebar";

export default function BaseLayout({ children }) {
  const { accountApi } = useWeb3();
  const { account } = accountApi;

  return (
    <main className="flex min-h-screen max-w-[1500px] mx-auto">
      <Sidebar />
      <div className="flex-grow border-l border-gray-700 sm:ml-[73px] xl:ml-[300px]">
        <div>
          <nav className="flex items-center justify-end mr-6 mt-3">
            {account ? <AccountAddress address={account} /> : <ConnectButton />}
          </nav>
          {children}
        </div>
      </div>
    </main>
  );
}
