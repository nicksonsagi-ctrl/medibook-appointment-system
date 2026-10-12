import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { readableError } from '../../lib/domain';
import { ErrorState, Skeleton, Button } from '../ui';
export default function ProtectedRoute({role}) {
 const auth=useAuth(); const location=useLocation();
 if(auth.loading) return <div className="container page-container"><Skeleton/></div>;
 if(!auth.user) return <Navigate to="/login" replace state={{from:location.pathname+location.search}}/>;
 if(auth.error || !auth.profile) return <div className="container page-container"><ErrorState error={auth.error||new Error('Your profile is missing. Ask your clinic administrator to check the signup profile trigger.')} retry={()=>window.location.reload()}/><Button variant="outline" className="mt-4" onClick={async()=>{try{await auth.logout();}catch(e){toast.error(readableError(e));}}}>Sign out and try another account</Button></div>;
 if(auth.role!==role) return <Navigate to="/forbidden" replace/>;
 return <Outlet/>;
}
