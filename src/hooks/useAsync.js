import { useCallback, useEffect, useRef, useState } from 'react';
export function useAsync(loader, dependencies = []) {
 const ref = useRef(loader); ref.current = loader;
 const generation = useRef(0);
 const [state,setState] = useState({data:null,loading:true,error:null});
 const reload = useCallback(async()=>{
 const current = ++generation.current;
 setState(s=>({...s,loading:true,error:null}));
 try { const data = await ref.current(); if(current===generation.current) setState({data,loading:false,error:null}); return data; }
 catch(error) { if(current===generation.current) setState(s=>({...s,loading:false,error})); return null; }
 }, dependencies);
 useEffect(()=>{ reload(); return ()=>{ generation.current++; }; },[reload]);
 return {...state,reload};
}
