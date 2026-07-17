import * as React from "react"
import { cn } from "../../lib/utils"
import { uiStyles } from "../../lib/ui-style"

const TableWrap = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} data-ui-slot="table-wrap" className={cn(uiStyles.tableWrap, className)} {...props} />
  )
)
TableWrap.displayName = "TableWrap"

const Table = React.forwardRef<HTMLTableElement, React.TableHTMLAttributes<HTMLTableElement>>(
  ({ className, ...props }, ref) => (
    <table ref={ref} data-ui-slot="table" className={cn("w-full text-sm", className)} {...props} />
  )
)
Table.displayName = "Table"

const TableHead = React.forwardRef<HTMLTableSectionElement, React.HTMLAttributes<HTMLTableSectionElement>>(
  ({ className, ...props }, ref) => (
    <thead ref={ref} data-ui-slot="table-head" className={cn(uiStyles.tableHead, className)} {...props} />
  )
)
TableHead.displayName = "TableHead"

const TableRow = React.forwardRef<HTMLTableRowElement, React.HTMLAttributes<HTMLTableRowElement>>(
  ({ className, ...props }, ref) => (
    <tr ref={ref} data-ui-slot="table-row" className={cn(uiStyles.tableRow, className)} {...props} />
  )
)
TableRow.displayName = "TableRow"

const TableHeaderCell = React.forwardRef<HTMLTableCellElement, React.ThHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <th ref={ref} data-ui-slot="table-header-cell" className={cn("px-3 py-2 font-medium", className)} {...props} />
  )
)
TableHeaderCell.displayName = "TableHeaderCell"

const TableCell = React.forwardRef<HTMLTableCellElement, React.TdHTMLAttributes<HTMLTableCellElement>>(
  ({ className, ...props }, ref) => (
    <td ref={ref} data-ui-slot="table-cell" className={cn("px-3 py-2", className)} {...props} />
  )
)
TableCell.displayName = "TableCell"

export { Table, TableWrap, TableHead, TableRow, TableHeaderCell, TableCell }
