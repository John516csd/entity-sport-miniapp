import Taro from "@tarojs/taro";
import { BASE_API_URL } from "../constants";

// 响应接口
interface ResponseData<T = any> {
  code: number;
  data: T;
  message: string;
  request_id: string;
}

// 请求配置接口
interface RequestOptions extends Omit<Taro.request.Option, 'url'> {
  url: string;
  showLoading?: boolean;
  showError?: boolean;
}

// 请求默认配置
const DEFAULT_OPTIONS = {
  showLoading: true,
  showError: true,
};

// 请求拦截器
const requestInterceptor = (options: RequestOptions) => {
  const token = Taro.getStorageSync('token');
  
  const finalOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
    header: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.header,
    },
    url: `${BASE_API_URL}${options.url}`,
  };

  // 请求日志
  console.log('🔧 BASE_API_URL:', BASE_API_URL);
  console.log('🔧 options.url:', options.url);
  console.log(`🚀～ request: ${finalOptions.method} ${finalOptions.url}`, finalOptions.data || '');

  if (finalOptions.showLoading) {
    Taro.showLoading({ title: '加载中...' });
  }

  return finalOptions;
};

// 响应拦截器
const responseInterceptor = async (res: Taro.request.SuccessCallbackResult<ResponseData>) => {
  const { statusCode, data } = res;

  // 响应日志
  console.log(`🚀～ response: ${statusCode}`, data);

  // 请求成功
  if (statusCode === 200) {
    if (data.code === 200) {
      return data.data; // 解包data字段返回真正的响应数据
    } else {
      throw new Error(data.message || '请求失败');
    }
  }

  // 401 未授权
  if (statusCode === 401) {
    Taro.removeStorageSync('token');
    // 可以在这里处理重新登录逻辑
    throw new Error('请重新登录');
  }

  throw new Error(data.message || '请求失败');
};

// 统一请求方法
const request = async <T = any>(options: RequestOptions): Promise<T> => {
  const shouldShowLoading = options.showLoading !== false;
  
  try {
    if (shouldShowLoading) {
      Taro.showLoading({ title: '加载中...' });
    }
    
    const finalOptions = requestInterceptor(options);
    const res = await Taro.request(finalOptions);
    const data = await responseInterceptor(res);
    return data as T;
  } catch (error) {
    // 对于登录等关键操作，确保错误能够正确传递
    console.error('Request failed:', error);
    throw error;
  } finally {
    if (shouldShowLoading) {
      Taro.hideLoading();
    }
  }
};

// 文件上传方法 - 使用 POST multipart 上传
const uploadFile = async <T = any>(
  url: string,
  filePath: string,
  name: string = 'file',
  formData?: Record<string, any>
): Promise<T> => {
  const token = Taro.getStorageSync('token');
  
  try {
    Taro.showLoading({ title: '上传中...' });
    
    // Taro.uploadFile 只支持 POST 请求，不使用 _method 参数
    const finalFormData = {
      ...formData,
    };
    
    const uploadOptions = {
      url: `${BASE_API_URL}${url}`,
      filePath,
      name,
      formData: finalFormData,
      header: {
        'Authorization': token ? `Bearer ${token}` : '',
      },
    };
    
    console.log(`🚀～ upload request:`, uploadOptions);
    
    const res = await Taro.uploadFile(uploadOptions);

    console.log(`🚀～ upload response: ${res.statusCode}`, res.data);

    if (res.statusCode === 200 || res.statusCode === 201) {
      try {
        const responseData = JSON.parse(res.data) as ResponseData<T>;
        if (responseData.code === 200) {
          return responseData.data;
        } else {
          throw new Error(responseData.message || '上传失败');
        }
      } catch (parseError) {
        console.error('Failed to parse upload response:', parseError);
        throw new Error('服务器响应格式错误');
      }
    }
    
    throw new Error(`上传失败，状态码: ${res.statusCode}`);
  } catch (error) {
    Taro.showToast({
      title: error.message || '上传失败',
      icon: 'none',
    });
    throw error;
  } finally {
    Taro.hideLoading();
  }
};

// 封装常用请求方法
export const http = {
  get: <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) => {
    return request<T>({
      url,
      method: 'GET',
      data,
      ...options,
    });
  },

  post: <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) => {
    return request<T>({
      url,
      method: 'POST',
      data,
      ...options,
    });
  },

  put: <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) => {
    return request<T>({
      url,
      method: 'PUT',
      data,
      ...options,
    });
  },

  delete: <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) => {
    return request<T>({
      url,
      method: 'DELETE',
      data,
      ...options,
    });
  },

  upload: uploadFile,
}; 