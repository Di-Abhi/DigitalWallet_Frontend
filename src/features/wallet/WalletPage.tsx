import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { LoadingPage } from '../../shared/components/UI';
import { IconButton } from '../../shared/components/Button';
import { ScratchCardModal } from '../../shared/components/ScratchCard';
import { useNotifications } from '../../store/NotificationContext';
import { toast } from '../../shared/components/Toast';
import NoWalletBanner from '../../shared/components/NoWalletBanner';
import { useWallet, useWithdraw, useStatement } from './hooks/useWallet';
import { BalanceCard }       from './components/BalanceCard';
import { WalletLedger }      from './components/WalletLedger';
import { StatementDownload } from './components/StatementDownload';
import { AddMoneyModal }     from './components/AddMoneyModal';
import { WithdrawModal }     from './components/WithdrawModal';

export default function WalletPage() {
  const { addNotification } = useNotifications();
  const [page, setPage]           = useState(0);
  const [addModal, setAddModal]   = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  const {
    balance, ledger, totalPages, loading, walletMissing, kycStatus,
    amount, setAmount, payStatus, lastPayment, failMsg,
    scratchModal, setScratchModal, scratchAmount,
    loadData, resetAddModal, handleAddMoney, setPayStatusSafe,
  } = useWallet(page);

  const { withdrawAmt, setWithdrawAmt, withdrawLoading, handleWithdraw } = useWithdraw(() => {
    setWithdrawOpen(false);
    loadData();
  });

  const { stmtFrom, setStmtFrom, stmtTo, setStmtTo, downloadStatement } = useStatement();

  useEffect(() => { loadData(); }, [loadData]);

  const handleCloseAddModal = () => { setAddModal(false); resetAddModal(); };

  if (loading) return <LoadingPage />;

  if (walletMissing) return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Wallet</h1>
        <IconButton icon={<RefreshCw className="w-4 h-4" />} label="Refresh" onClick={loadData} />
      </div>
      <NoWalletBanner kycStatus={kycStatus} variant="page" />
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Wallet</h1>
        <IconButton icon={<RefreshCw className="w-4 h-4" />} label="Refresh" onClick={loadData} />
      </div>

      <BalanceCard
        balance={balance!}
        onAddMoney={() => setAddModal(true)}
        onWithdraw={() => setWithdrawOpen(true)}
      />

      <StatementDownload
        from={stmtFrom} to={stmtTo}
        onFrom={setStmtFrom} onTo={setStmtTo}
        onDownload={downloadStatement}
      />

      <WalletLedger
        entries={ledger} page={page}
        totalPages={totalPages} onPageChange={setPage}
      />

      <AddMoneyModal
        open={addModal}
        amount={amount}
        payStatus={payStatus}
        lastPayment={lastPayment}
        failMsg={failMsg}
        onAmount={setAmount}
        onClose={handleCloseAddModal}
        onSubmit={handleAddMoney}
        onRetry={() => { setPayStatusSafe('idle'); }}
      />

      <WithdrawModal
        open={withdrawOpen}
        balance={balance}
        amount={withdrawAmt}
        loading={withdrawLoading}
        onAmount={setWithdrawAmt}
        onClose={() => { setWithdrawOpen(false); setWithdrawAmt(''); }}
        onSubmit={handleWithdraw}
      />

      <ScratchCardModal
        open={scratchModal}
        onClose={() => setScratchModal(false)}
        triggerType="recharge"
        amount={scratchAmount}
        onPointsEarned={(pts) => {
          toast.success(`+${pts} bonus points added to your rewards!`, 'Scratch Reward');
          addNotification({ title: 'Scratch Card Reward', message: `You earned ${pts} bonus points!`, type: 'success' });
        }}
      />
    </div>
  );
}
