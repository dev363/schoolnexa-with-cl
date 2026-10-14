import { lazy, Suspense, type ComponentType } from 'react';

const Loading = () => (
  <div className="d-flex justify-content-center align-items-center py-5">
    <div className="spinner-border" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const LazyLoad = (loader: () => Promise<{ default: ComponentType<any> }>) => {
  const LazyComponent = lazy(loader);

  return function LazyLoadedComponent(props: any) {
    return (
      <Suspense fallback={<Loading />}>
        <LazyComponent {...props} />
      </Suspense>
    );
  };
};
export default LazyLoad;
