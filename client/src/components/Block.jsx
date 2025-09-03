import { Accordion, Table } from 'react-bootstrap';
import Transaction from './Transaction';

function Block({ block, blockNumber }) {
  const { timestamp, hash, data } = block;

  return (
    <Accordion.Item eventKey={hash}>
      <Accordion.Header>
        <div className="d-flex w-100 justify-content-between align-items-center pe-3">
          <span><strong>Block #{blockNumber}</strong></span>
          <span className="d-none d-md-block text-muted">
            Hash: {hash.substring(0, 20)}...
          </span>
          <span className="badge bg-secondary">{data.length} Txns</span>
        </div>
      </Accordion.Header>
      <Accordion.Body>
        <h5>Block Details</h5>
        <Table bordered hover responsive size="sm">
          <tbody>
            <tr>
              <td><strong>Timestamp</strong></td>
              <td>{new Date(timestamp).toLocaleString()}</td>
            </tr>
            <tr>
              <td><strong>Hash</strong></td>
              <td style={{ wordBreak: 'break-all' }}>{hash}</td>
            </tr>
            <tr>
              <td><strong>Last Hash</strong></td>
              <td style={{ wordBreak: 'break-all' }}>{block.lastHash}</td>
            </tr>
            <tr>
              <td><strong>Nonce</strong></td>
              <td>{block.nonce}</td>
            </tr>
            <tr>
              <td><strong>Difficulty</strong></td>
              <td>{block.difficulty}</td>
            </tr>
          </tbody>
        </Table>
        <h5 className="mt-4">Transactions</h5>
        {data.length > 0 ? (
          data.map(tx => <Transaction key={tx.id} transaction={tx} />)
        ) : (
          <p className="text-muted">No transactions in this block.</p>
        )}
      </Accordion.Body>
    </Accordion.Item>
  );
}

export default Block;