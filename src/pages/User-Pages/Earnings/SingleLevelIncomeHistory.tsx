
import DataTable from 'react-data-table-component';
import { Card, CardContent, TextField } from '@mui/material';
import { DASHBOARD_CUTSOM_STYLE, getLevelBenifitsColumns } from '../../../utils/DataTableColumnsProvider';
import { useGetTransactionDetails } from '../../../api/Memeber';

const SingleLevelIncomeHistory = () => {
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

  const singleLevelData = transactions
    .filter((transaction: any) => {
      if (!transaction || typeof transaction !== 'object') return false;

      const txType = transaction.transaction_type?.toLowerCase() || "";
      const descStr = transaction.description?.toLowerCase() || "";
      const benefitType = transaction.benefit_type?.toLowerCase() || "";

      // Only include single level / single line income / global income
      const isSingleLevel = txType.includes('single') || descStr.includes('single') || benefitType.includes('single');
      
      return isSingleLevel;
    })
    .map((transaction: any) => {
      let extractedMemberId = 'N/A';
      if (transaction.related_member_id) {
        extractedMemberId = transaction.related_member_id;
      } else if (transaction.description && transaction.description.includes('from ')) {
        const fromPart = transaction.description.split('from ')[1];
        extractedMemberId = fromPart ? fromPart.split("'")[0] : 'N/A';
      }

      return {
        id: transaction._id || transaction.transaction_id,
        date: transaction.transaction_date,
        payoutLevel: 'Single Leg Income', 
        memberName: transaction.related_member_name || '-',
        memberId: extractedMemberId,
        amount: ((parseFloat(transaction.ew_credit) || 0) + (parseFloat(transaction.uw_credit) || 0) + (parseFloat(transaction.fd_credit) || 0) + (parseFloat(transaction.pw_credit) || 0)).toFixed(2),
        description: transaction.description || 'Single Leg Income',
        transactionType: transaction.transaction_type
      };
    });

  const noDataComponent = (
    <div style={{ padding: '24px', color: '#000', textAlign: 'center', width: '100%', fontSize: '1.1rem' }}>
      No transactions found
    </div>
  );

  if (isError) {
    return (
      <Card sx={{ margin: '2rem', mt: 10 }}>
        <CardContent>
          <div style={{ padding: '24px', textAlign: 'center', color: 'red' }}>
            Error loading single leg income data: {(error as any)?.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ margin: '2rem', mt: 10, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
      <CardContent>
        <div style={{ marginBottom: "1rem", color: "#FFFF", fontWeight: "bold", fontSize: "1.25rem"     }}>
          List of Single Leg Income ({singleLevelData.length})
        </div>
          <DataTable
              columns={getLevelBenifitsColumns()}
              data={singleLevelData}
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
                    sx={{ input: { color: '#0F172A' }, '& .MuiOutlinedInput-notchedOutline': { borderColor: '#E2E8F0' } }}
                  />
                </div>
              }
            />
      </CardContent>
    </Card>
  );
};

export default SingleLevelIncomeHistory;
