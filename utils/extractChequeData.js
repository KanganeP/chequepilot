function extractChequeData(text) {
    const data = {
        bankName: "",
        branchName: "",
        ifscCode: "",
        chequeNumber: "",
        amount: "",
        chequeDate: "",
    };

    const upperText = text.toUpperCase();

    // Bank Name
    // if (upperText.includes("CENTRAL BANK OF INDIA")) {
    //     data.bankName = "Central Bank of India";
    // }

    // IFSC
    const ifscMatch = upperText.match(
        /[A-Z]{4}0[A-Z0-9]{6}/
    );

    if (ifscMatch) {
        data.ifscCode = ifscMatch[0];
    }

    const bankCode = data.ifscCode.substring(0, 4);

    const bankMap = {
        SBIN: "State Bank of India",
        HDFC: "HDFC Bank",
        ICIC: "ICICI Bank",
        UTIB: "Axis Bank",
        BARB: "Bank of Baroda",
        PUNB: "Punjab National Bank",
        CNRB: "Canara Bank",
        UBIN: "Union Bank of India",
        IDIB: "Indian Bank",
        BKID: "Bank of India",
        CBIN: "Central Bank of India",
        KKBK: "Kotak Mahindra Bank",
        INDB: "IndusInd Bank",
        IBKL: "IDBI Bank",
        YESB: "Yes Bank"
    };

    data.bankName = bankMap[bankCode] || "";

    // Branch
    const branchMatch = text.match(
        /BHOSARI.*?PUNE-?\d+/i
    );

    if (branchMatch) {
        data.branchName = branchMatch[0];
    }

    // Date
    const dateMatch = text.match(
        /\d{2}[\/.-]\d{2}[\/.-]\d{4}/
    );

    if (dateMatch) {
        data.chequeDate = dateMatch[0];
    }

    const amountWordMatch = text.match(
        /Rupees\s+([A-Za-z\s]+)/i
    );

    if (amountWordMatch) {
        data.amountInWords = amountWordMatch[1].trim();
    }

    return data;
}

module.exports = extractChequeData;