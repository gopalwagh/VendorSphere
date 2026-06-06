import "./DataTable.css";

const DataTable = ({ columns, data}) => {
  return (
    <table className="data-table">
      <thead>
        <tr>
          { columns.map((column) => ( <th key={column}>
            {column}
          </th>
        ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={index}>
            {Object.values(row).map((value, idx) => (
              <td key={idx}>
                {value}
              </td>
            )
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default DataTable;