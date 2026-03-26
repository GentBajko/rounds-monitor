import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { appsApi } from "../api/client"
import type { CreateAppBody, UpdateAppBody } from "../types"

export const useApps = () =>
  useQuery({ queryKey: ["apps"], queryFn: appsApi.list })

export const useApp = (id: string) =>
  useQuery({ queryKey: ["apps", id], queryFn: () => appsApi.get(id) })

export const useCreateApp = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (body: CreateAppBody) => appsApi.create(body),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["apps"] }) },
  })
}

export const useUpdateApp = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateAppBody }) => appsApi.update(id, body),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: ["apps"] })
      void queryClient.invalidateQueries({ queryKey: ["apps", id] })
    },
  })
}

export const useDeleteApp = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => appsApi.delete(id),
    onSuccess: () => { void queryClient.invalidateQueries({ queryKey: ["apps"] }) },
  })
}
