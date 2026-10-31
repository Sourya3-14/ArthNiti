// import Sidebar from '../components/Sidebar';

// const MainLayout = ({ children }) => {
//   return (
//     <div className="flex min-h-screen bg-gray-950 text-white font-sans selection:bg-blue-500/30">
//       <Sidebar />
//       <main className="flex-1 overflow-y-auto">
//         {children}
//       </main>
//     </div>
//   );
// };

// export default MainLayout;
import Sidebar from "../components/Sidebar";
import OnboardingChatbot from "../components/OnboardingChatbot";

const MainLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen w-full bg-slate-50 dark:bg-gray-950 text-slate-900 dark:text-white font-sans selection:bg-blue-500/30 transition-colors duration-200">
      <Sidebar />
      {/* Added w-full and min-w-0 */}
      <main className="flex-1 w-full min-w-0 overflow-y-auto">{children}</main>
      <OnboardingChatbot />
    </div>
  );
};

export default MainLayout;
