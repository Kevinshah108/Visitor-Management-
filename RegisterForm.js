// RegisterForm.js

import React, { useState } from "react";
import axios from "axios";

const RegisterForm = () => {
  const [user, setUser] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [contact, setContact] = useState("");
  const [BirthDay, setBirthDay] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/", {
        user,
        email,
        password,
        contact,
        BirthDay,
      });
      console.log(response.data);
      // Handle success, show success message or redirect
    } catch (error) {
      console.error("Error:", error.response.data);
      // Handle error, show error message to user
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Username"
        value={user}
        onChange={(e) => setUser(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <input
        type="text"
        placeholder="Contact"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
      />
      <input
        type="text"
        placeholder="Birthday"
        value={BirthDay}
        onChange={(e) => setBirthDay(e.target.value)}
      />
      <button type="submit">Register</button>
    </form>
  );
};

export default RegisterForm;
