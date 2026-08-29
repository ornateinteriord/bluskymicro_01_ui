import DataTable from 'react-data-table-component';
import { Card, CardContent, TextField } from '@mui/material';
import { DASHBOARD_CUTSOM_STYLE, getLevelBenifitsColumns } from '../../../utils/DataTableColumnsProvider';
import { useGetTransactionDetails } from '../../../api/Memeber';

const ReferralBonus = () => {
  const {
    data: transactionsData,
    isLoading,
    isError,
    error,
  } = useGetTransactionDetails();

  // Ensure transactions is always an array
  const transactions = Array.isArray(transactionsData?.data)
    ? transactionsData.data
    : Array.isArray(transactionsData)
      ? transactionsData
      : [];

  const referralBonusData = transactions
    .filter((transaction: any) => {
      if (!transaction || typeof transaction !== 'object') return false;

      const txType = transaction.transaction_type?.toLowerCase() || "";
      const descStr = transaction.description?.toLowerCase() || "";

      const isReferral = txType === 'direct benefits' || 
                         descStr === 'direct benefits' || 
                         txType.includes('referral') || 
                         descStr.includes('referral');
      
      return isReferral;
    })
    .map((transaction: any) => {
      // Show actual description but provide a fallback
      let payoutLvl = transaction.description || transaction.transaction_type || 'Referral Bonus';
      
      return {
        id: transaction._id || transaction.transaction_id,
        date: transaction.transaction_date,
        payoutLevel: payoutLvl,
        memberName: transaction.related_member_name || 'N/A',
        memberId: transaction.related_member_id || 'N/A',
        amount: `${((parseFloat(transaction.ew_credit) || 0) + (parseFloat(transaction.uw_credit) || 0) + (parseFloat(transaction.fd_credit) || 0) + (parseFloat(transaction.pw_credit) || 0)).toFixed(2)}`,
        description: transaction.description,
        transactionType: transaction.transaction_type
      };
    });

  const noDataComponent = (
    <div style={{ padding: '24px' }}>
      No referral bonus data available
    </div>
  );

  if (isError) {
    return (
      <Card sx={{ margin: '2rem', mt: 10 }}>
        <CardContent>
          <div style={{ padding: '24px', textAlign: 'center', color: 'red' }}>
            Error loading referral bonus data: {error?.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ margin: '2rem', mt: 10 }}>
      <CardContent>
        <div style={{ marginBottom: "1rem", color: "#000", fontWeight: "bold", fontSize: "1.25rem"     }}>List of Referral Bonus ({referralBonusData.length})</div>
          <DataTable
              columns={getLevelBenifitsColumns()}
              data={referralBonusData}
              pagination
              customStyles={DASHBOARD_CUTSOM_STYLE}
              paginationPerPage={25}
              paginationRowsPerPageOptions={[25, 50, 100]}
              noDataComponent={noDataComponent}
              highlightOnHover
              progressPending={isLoading}
              subHeader
              subHeaderComponent={
                <div style={{ display: 'flex', justifyContent: 'flex-end', width: '100%', padding: '0.5rem' }}>
                  <TextField
                    placeholder="Search"
                    variant="outlined"
                    size="small"
                  />
                </div>
              }
            />
      </CardContent>
    </Card>
  );
};

export default ReferralBonus;
