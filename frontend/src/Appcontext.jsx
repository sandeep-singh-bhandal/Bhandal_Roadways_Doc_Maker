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

  const value = {
    biltyData,
    setBiltyData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
