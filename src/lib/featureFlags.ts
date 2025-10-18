import { FeatureFlags, getFeatureFlags } from "@/config/features";
import { useEffect, useMemo, useState } from "react";

const cachedFlags: FeatureFlags = getFeatureFlags();

export function isFeatureEnabled<K extends keyof FeatureFlags>(flag: K): boolean {
  return cachedFlags[flag];
}

export function useFeatureFlag<K extends keyof FeatureFlags>(flag: K): boolean {
  const initial = useMemo(() => isFeatureEnabled(flag), [flag]);
  const [enabled, setEnabled] = useState<boolean>(initial);

  useEffect(() => {
    setEnabled(isFeatureEnabled(flag));
  }, [flag]);

  return enabled;
}


