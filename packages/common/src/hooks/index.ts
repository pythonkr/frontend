import BackendAPIHooks from "./useAPI";
import BackendAdminAPIHooks from "./useAdminAPI";
import { useCommonContext as useCommonContextHook } from "./useCommonContext";
import { useEmail as useEmailHook } from "./useEmail";
import BackendParticipantPortalAPIHooks from "./useParticipantPortalAPI";

export namespace CommonHooks {
  export const useCommonContext = useCommonContextHook;
  export const useEmail = useEmailHook;
}

namespace Hooks {
  export const Common = CommonHooks;
  export const BackendAPI = BackendAPIHooks;
  export const BackendAdminAPI = BackendAdminAPIHooks;
  export const BackendParticipantPortalAPI = BackendParticipantPortalAPIHooks;
}

export default Hooks;
