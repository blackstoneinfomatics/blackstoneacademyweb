import React from 'react'
import TransactionOverviewCards from './TransactionOverviewCards'
import TransactionsTable from './TransactionTable'

function TransactionsTab() {
  return (
    <div>
      <TransactionOverviewCards/>
      <TransactionsTable/>
    </div>
  )
}

export default TransactionsTab
