import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertyApi } from '../utils/apiClient';
import { toast } from 'react-toastify';

/**
 * Hook to fetch properties with optional filters
 * @param {Object} filters - Filter criteria for properties
 * @param {Object} options - Additional query options
 * @returns {Object} Query result
 */
export function useProperties(filters = {}, options = {}) {
  return useQuery({
    queryKey: ['properties', filters],
    queryFn: () => propertyApi.getProperties(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    keepPreviousData: true,
    ...options,
    onError: (error) => {
      toast.error(`Failed to fetch properties: ${error.message}`);
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to fetch details of a specific property
 * @param {string} id - Property ID
 * @param {Object} options - Additional query options
 * @returns {Object} Query result
 */
export function usePropertyDetails(id, options = {}) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyApi.getPropertyById(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!id,
    ...options,
    onError: (error) => {
      toast.error(`Failed to load property details: ${error.message}`);
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to search properties with query and filters
 * @param {string} query - Search query
 * @param {Object} filters - Filter criteria
 * @param {Object} options - Additional query options
 * @returns {Object} Query result
 */
export function useSearchProperties(query, filters = {}, options = {}) {
  return useQuery({
    queryKey: ['properties', 'search', query, filters],
    queryFn: () => propertyApi.searchProperties(query, filters),
    enabled: !!query,
    keepPreviousData: true,
    staleTime: 3 * 60 * 1000, // 3 minutes
    ...options,
    onError: (error) => {
      toast.error(`Search failed: ${error.message}`);
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to create a new property
 * @returns {Object} Mutation result
 */
export function useCreateProperty(options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (propertyData) => propertyApi.createProperty(propertyData),
    onSuccess: (newProperty, variables) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      toast.success('Property created successfully!');
      options?.onSuccess?.(newProperty, variables);
    },
    onError: (error) => {
      toast.error(`Failed to create property: ${error.message}`);
      options?.onError?.(error);
    }
  });
}

/**
 * Hook to update a property
 * @returns {Object} Mutation result
 */
export function useUpdateProperty(options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => propertyApi.updateProperty(id, data),
    // Optimistic update
    onMutate: async ({ id, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['property', id] });
      
      // Snapshot the previous value
      const previousProperty = queryClient.getQueryData(['property', id]);
      
      // Optimistically update to the new value
      queryClient.setQueryData(['property', id], old => ({ ...old, ...data }));
      
      // Return a context object with the snapshot
      return { previousProperty, id };
    },
    onSuccess: (updatedProperty) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.invalidateQueries({ queryKey: ['property', updatedProperty._id] });
      toast.success('Property updated successfully!');
      options?.onSuccess?.(updatedProperty);
    },
    onError: (error, variables, context) => {
      // Restore previous value if mutation fails
      if (context?.id) {
        queryClient.setQueryData(['property', context.id], context.previousProperty);
      }
      toast.error(`Failed to update property: ${error.message}`);
      options?.onError?.(error, variables, context);
    }
  });
}

/**
 * Hook to delete a property
 * @returns {Object} Mutation result
 */
export function useDeleteProperty(options = {}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => propertyApi.deleteProperty(id),
    // Optimistic update
    onMutate: async (id) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['properties'] });
      
      // Snapshot the previous value
      const previousProperties = queryClient.getQueryData(['properties']);
      
      // Optimistically remove property from list
      if (previousProperties?.data) {
        queryClient.setQueryData(['properties'], old => ({
          ...old,
          data: old.data.filter(property => property._id !== id)
        }));
      }
      
      // Return a context object with the snapshot
      return { previousProperties };
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['properties'] });
      queryClient.removeQueries({ queryKey: ['property', id] });
      toast.success('Property deleted successfully!');
      options?.onSuccess?.(data, id);
    },
    onError: (error, id, context) => {
      // Restore previous properties if mutation fails
      if (context?.previousProperties) {
        queryClient.setQueryData(['properties'], context.previousProperties);
      }
      toast.error(`Failed to delete property: ${error.message}`);
      options?.onError?.(error, id, context);
    }
  });
}

/**
 * Hook to fetch paginated properties
 * @param {number} page - Current page number
 * @param {number} limit - Number of items per page
 * @param {Object} filters - Filter criteria
 * @param {Object} options - Additional query options
 * @returns {Object} Query result
 */
export function usePaginatedProperties(page = 1, limit = 10, filters = {}, options = {}) {
  return useQuery({
    queryKey: ['properties', 'paginated', page, limit, filters],
    queryFn: () => propertyApi.getPaginatedProperties(page, limit, filters),
    keepPreviousData: true,
    staleTime: 3 * 60 * 1000, // 3 minutes
    ...options,
    onError: (error) => {
      toast.error(`Failed to fetch properties: ${error.message}`);
      options?.onError?.(error);
    }
  });
}
