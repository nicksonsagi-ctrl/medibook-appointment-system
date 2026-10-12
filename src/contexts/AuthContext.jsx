import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { supabase } from '../lib/supabase';
const Context = createContext(null);
export function AuthProvider({children}) {
 const [state,setState] = useState({user:null,profile:null,loading:!!supabase,error:null});
 const revision = useRef(0);
 useEffect(()=>{
 if(!supabase) return;
 let alive=true;
 async function restore(session) {
 const current=++revision.current;
 setState(s=>({...s,user:session?.user||null,profile:null,loading:!!session,error:null}));
 if(!session) return;
 try {
 const {data,error}=await supabase.from('profiles').select('id,full_name,phone,role').eq('id',session.user.id).single();
 if(error) throw error;
 if(alive && current===revision.current) setState({user:session.user,profile:data,loading:false,error:null});
 } catch(error) { if(alive && current===revision.current) setState({user:session.user,profile:null,loading:false,error}); }
 }
 supabase.auth.getSession().then(({data,error})=>{if(!alive)return; if(error) setState({user:null,profile:null,loading:false,error}); else restore(data.session);});
 const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{if(alive) setTimeout(()=>{if(alive) restore(session);},0);});
 return ()=>{alive=false;revision.current++;subscription.unsubscribe();};
 },[]);
 async function logout() {if(!supabase)return;const {error}=await supabase.auth.signOut();if(error)throw error;setState({user:null,profile:null,loading:false,error:null});}
 return <Context.Provider value={{...state,role:state.profile?.role?.toLowerCase(),logout}}>{children}</Context.Provider>;
}
export const useAuth=()=>useContext(Context);
