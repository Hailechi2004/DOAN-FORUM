import React, { createContext, useContext, useEffect, useState } from "react";
import { useSelector } from "react-redux";

const DepartmentContext = createContext();

export const useDepartment = () => {
  const context = useContext(DepartmentContext);
  if (!context) {
    throw new Error("useDepartment must be used within DepartmentProvider");
  }
  return context;
};

export const DepartmentProvider = ({ children }) => {
  const { user } = useSelector((state) => state.auth);
  const [departmentId, setDepartmentId] = useState(null);

  useEffect(() => {
    if (user?.department_id) {
      setDepartmentId(user.department_id);
    }
  }, [user]);

  const value = {
    departmentId,
    isManager: user?.role === "Department Manager" || user?.role === "manager",
    user,
  };

  return (
    <DepartmentContext.Provider value={value}>
      {children}
    </DepartmentContext.Provider>
  );
};
