import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Scenes from "@/pages/Scenes";
import SceneDetail from "@/pages/SceneDetail";
import SceneCreate from "@/pages/SceneCreate";
import VideoCreate from "@/pages/VideoCreate";
import Write from "@/pages/Write";
import Translate from "@/pages/Translate";
import Works from "@/pages/Works";
import Profile from "@/pages/Profile";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/scenes" element={<Scenes />} />
          <Route path="/scenes/:id" element={<SceneDetail />} />
          <Route path="/scenes/:id/create" element={<SceneCreate />} />
          <Route path="/create/video" element={<VideoCreate />} />
          <Route path="/create/translate" element={<Translate />} />
          <Route path="/create/write" element={<Write />} />
          <Route path="/works" element={<Works />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </Router>
  );
}
