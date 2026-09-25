const axios = require('axios');

async function testCreateInvoice() {
  try {
    const res = await axios.post('http://localhost:8080/api/invoices', {
      patientId: 1, // Assume patient 1 exists
      items: [
        {
          description: "Test",
          quantity: 1,
          unitPrice: 100,
          itemType: "OTHER"
        }
      ],
      discount: 0,
      tax: 0,
      notes: "",
      paymentMethod: "CASH"
    }, {
      headers: {
        'Content-Type': 'application/json'
        // Need auth token if secured!
      }
    });
    console.log("Success:", res.data);
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}

testCreateInvoice();
