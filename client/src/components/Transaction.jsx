import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const AddressLink = ({ address }) => (
  <Link to={`/address/${address}`} style={{ wordBreak: 'break-all' }}>
    {address.substring(0, 15)}...
  </Link>
);

function Transaction({ transaction }) {
  const { id, input, outputMap } = transaction;
  const recipients = Object.keys(outputMap);

  const isReward = input.address === '*authorized-reward*';

  return (
    <Card className="mb-3">
      <Card.Header className="py-2">
        <small className="text-muted">Tx ID: {id}</small>
      </Card.Header>
      <Card.Body className="py-2">
        <div className="row">
          <div className="col-md-5">
            <strong>From:</strong>{' '}
            {isReward ? (
              <span className="text-success">_Mining Reward_</span>
            ) : (
              <AddressLink address={input.address} />
            )}
          </div>
          <div className="col-md-7">
            {recipients.map(recipient => (
              <div key={recipient}>
                <strong>To:</strong> <AddressLink address={recipient} />
                <span className="badge bg-success float-end">{outputMap[recipient]} MyCoin</span>
              </div>
            ))}
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

export default Transaction;