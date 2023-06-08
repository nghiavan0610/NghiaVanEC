import { useMutation, useQuery, useQueryClient } from 'react-query';
import { axios_instance } from '../utils/axios';
import { showToast } from '../utils/toast';

const getJobs = () => {
  let url = `/jobs`;
  return axios_instance(url);
};

export const useJobs = () => {
  return useQuery([], getJobs, {
    onError: () => {
      showToast('error', 'Lỗi khi tải jobs');
    },
    staleTime: Infinity,
    select: ({ data }) => {
      return data.data.jobs;
    },
  });
};
