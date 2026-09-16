import Sidebar from '@/components/sidebar'; import '../globals.css';
export default function Layout({children}:{children:React.ReactNode}){return <div className="app"><Sidebar/><main className="main">{children}</main></div>}
