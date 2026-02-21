const expiryEmailTemplate = ({ productName, expiredQty, expiryDate, remainingStock }) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2 style="color: red;">⚠ Batch Expiry Alert</h2>

      <p><strong>Product:</strong> ${productName}</p>
      <p><strong>Expired Quantity:</strong> ${expiredQty}</p>
      <p><strong>Expiry Date:</strong> ${new Date(expiryDate).toDateString()}</p>
      <p><strong>Remaining Stock:</strong> ${remainingStock}</p>

      <hr />
      <p style="font-size: 12px; color: gray;">
        This is an automated notification from Smart Inventory System.
      </p>
    </div>
  `;
};

export default expiryEmailTemplate;