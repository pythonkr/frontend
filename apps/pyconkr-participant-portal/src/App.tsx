import * as React from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { Layout } from "./components/layout.tsx";
import { LandingPage } from "./components/pages/home.tsx";
import { ProfileEditor } from "./components/pages/profile_editor.tsx";
import { SessionEditor } from "./components/pages/session_editor";
import { SignInPage } from "./components/pages/signin.tsx";
import { SponsorEditor } from "./components/pages/sponsor_editor";

export const App: React.FC = () => (
  <Routes>
    <Route element={<Layout />}>
      <Route path="/" element={<LandingPage />} />
      <Route path="/signin" element={<SignInPage />} />
      <Route path="/user" element={<ProfileEditor />} />
      <Route path="/sponsor/:id" element={<SponsorEditor />} />
      <Route path="/session/:id" element={<SessionEditor />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  </Routes>
);
