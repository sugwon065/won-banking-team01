import Greeting from "./Greeting";
import TotalAssetCard from "./TotalAssetCard";
import QuickMenu from "./QuickMenu";
import AccountSection from "./AccountSection";
import RecentTransactionSection from "./RecentTransactionSection";

export default function HomeScreen({ accounts, transactions, onNavigate, onTransfer }) {
  return (
    <section className="screen home-screen" aria-labelledby="home-title">
      <div className="home-top">
        <Greeting />
        <TotalAssetCard accounts={accounts} />
        <QuickMenu onNavigate={onNavigate} />
      </div>
      <AccountSection accounts={accounts} onNavigate={onNavigate} onTransfer={onTransfer} />
      <RecentTransactionSection accounts={accounts} transactions={transactions} />
    </section>
  );
}
