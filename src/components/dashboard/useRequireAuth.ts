import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

/** Client-side guard: keeps customer pages scoped to the signed-in user. */
export function useRequireAuth() {
  const navigate = useNavigate();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let active = true;

    void (async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!active) return;
      if (error || !data.user) {
        await navigate({ to: "/login" });
        return;
      }
      setChecked(true);
    })();

    return () => {
      active = false;
    };
  }, [navigate]);

  return checked;
}
