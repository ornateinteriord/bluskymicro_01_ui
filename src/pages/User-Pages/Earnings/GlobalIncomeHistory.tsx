
import DataTable from 'react-data-table-component';
import { Card, CardContent, TextField } from '@mui/material';
import { DASHBOARD_CUTSOM_STYLE, getLevelBenifitsColumns } from '../../../utils/DataTableColumnsProvider';
import { useGetTransactionDetails } from '../../../api/Memeber';

const GlobalIncomeHistory = () => {
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

  const globalIncomeData = transactions
    .filter((transaction: any) => {
      if (!transaction || typeof transaction !== 'object') return false;

      const txType = transaction.transaction_type || "";

      // Only include global income
      return txType === "Global Income";
    })
    .map((transaction: any) => {
      let extractedMemberId = 'N/A';
      if (transaction.related_member_id) {
        extractedMemberId = transaction.related_member_id;
      } else if (transaction.description && transaction.description.includes('from ')) {
        const fromPart = transaction.description.split('from ')[1];
        if (fromPart) {
          extractedMemberId = fromPart.split(' ')[0]; // usually format is "from U000101"
        }
      }

      return {
        id: transaction._id || transaction.transaction_id,
        date: transaction.transaction_date,
        payoutLevel: '12% Global Non Working', 
        memberName: transaction.related_member_name || '-',
        memberId: extractedMemberId,
        amount: ((parseFloat(transaction.ew_credit) || 0) + (parseFloat(transaction.uw_credit) || 0) + (parseFloat(transaction.fd_credit) || 0) + (parseFloat(transaction.pw_credit) || 0)).toFixed(2),
        description: transaction.description || 'Global Income',
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
            Error loading global income data: {(error as any)?.message}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ margin: '2rem', mt: 10, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '16px' }}>
      <CardContent>
        <div style={{ marginBottom: "1rem", color: "#FFFF", fontWeight: "bold", fontSize: "1.25rem"     }}>
          List of 12% Global Non Working ({globalIncomeData.length})
        </div>
          <DataTable
              columns={getLevelBenifitsColumns()}
              data={globalIncomeData}
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

export default GlobalIncomeHistory;
