import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { screenshotsApi } from "../api/client"

export const useScreenshots = (appId: string, page: number = 1) =>
  useQuery({
    queryKey: ["screenshots", appId, page],
    queryFn: () => screenshotsApi.list(appId, page),
    refetchInterval: 30_000,
  })

export const useTriggerCapture = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (appId: string) => screenshotsApi.capture(appId),
    onSuccess: (_data, appId) => {
      void queryClient.invalidateQueries({ queryKey: ["screenshots", appId] })
    },
  })
}
