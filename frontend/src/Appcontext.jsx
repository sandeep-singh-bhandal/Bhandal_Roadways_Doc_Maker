import { createContext, useContext, useState } from "react";

export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [biltyData, setBiltyData] = useState({
    lrNo: "",
    invoiceNo: "",
    eWayBillNo: "",
    truckNo: "",
    from: "",
    to: "",
    consignor: { name: "", address: "", gstNumber: "" },
    consignee: { name: "", address: "", gstNumber: "" },
    packages: [],
    includeDigitalStamp: false,
  });
  const [billData, setBillData] = useState({
    billNo: "",
    receipientName: "",
    receipientAddress: "",
    through: "",
    vehicleNo: "",
    from: "",
    to: "",
    note1: "",
    note2: "",
    billDetails: {
      halting: "",
      extra: "",
      total: "",
      advance: "",
      balance: "",
    },
    lrs: [],
    includeDigitalStamp: false,
  });

  const value = {
    biltyData,
    setBiltyData,
    billData,
    setBillData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
