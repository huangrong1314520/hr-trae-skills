import { HashRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import DubMaterials from "@/pages/DubMaterials";
import DubRecord from "@/pages/DubRecord";
import DubWorks from "@/pages/DubWorks";
import Write from "@/pages/Write";
import Translate from "@/pages/Translate";
import Groups from "@/pages/Groups";
import GroupDetail from "@/pages/GroupDetail";
import Achievements from "@/pages/Achievements";
import Profile from "@/pages/Profile";
import { useAuthStore } from "@/hooks/useStore";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/courses/:lang/:level/:unit" element={<CourseDetail />} />
          <Route path="/dub" element={<DubMaterials />} />
          <Route path="/dub/works" element={<DubWorks />} />
          <Route path="/dub/:id" element={<DubRecord />} />
          <Route path="/write" element={<Write />} />
          <Route path="/translate" element={<Translate />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:lang" element={<GroupDetail />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Route>
      </Routes>
    </Router>
  );
}
