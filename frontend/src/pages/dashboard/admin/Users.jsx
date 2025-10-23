import React from "react";
import UserSection from "../../../components/UI/admin/UserSection";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers } from "@fortawesome/free-solid-svg-icons";

const Users = () => {
  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center">
          <div className="bg-red-100 p-3 rounded-lg mr-4">
            <FontAwesomeIcon icon={faUsers} className="text-red-600 text-xl" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Users Management</h1>
            <p className="text-gray-600">Manage users on NES Properties platform</p>
          </div>
        </div>
      </div>
      
      <UserSection />
    </div>
  );
};

export default Users;