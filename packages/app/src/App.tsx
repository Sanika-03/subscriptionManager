import { useState, useEffect } from 'react';
import { 
  SubscriptionDataType, 
  // ApiFailureType,
  GetSubscriptionsListApiResponse,
  GetCurrentSubscriptionApiResponse,
  UpgradeSubscriptionApiResponse,
  DowngradeSubscriptionApiResponse
 } from './types';
import Loader from './Components/Loader';

export default function App() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionDataType[]>([]);
  const [currentSubscription, setCurrentSubscription] = useState<SubscriptionDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSubscriptions = () => {
    setLoading(true);
    setError(null);
    
    return fetch('http://localhost:3000/api/subscriptions')
      .then(response => response.json())
      .then((data: GetSubscriptionsListApiResponse) => {
        if (data.status === 'success') {
          setSubscriptions(data.data);
        } else {
          setError(data.error);
        }
      })
      .catch(() => {
        setError('Failed to fetch subscriptions. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const fetchCurrentSubscription = () => {
    return fetch('http://localhost:3000/api/subscriptions/current')
      .then(response => response.json())
      .then((data: GetCurrentSubscriptionApiResponse) => {
        if (data.status === 'success') {
          setCurrentSubscription(data.data);
        } else {
          console.error('Failed to fetch current subscription:', data.error);
        }
      })
      .catch(err => {
        console.error('Failed to fetch current subscription:', err);
      });
  };

  useEffect(() => {
    const initializeData = async () => {
      await fetchSubscriptions();
      await fetchCurrentSubscription();
    };
    
    initializeData();
  }, []);

  const handleRetry = () => {
    fetchSubscriptions();
    fetchCurrentSubscription();
  };

  return (
    <>
    {loading && <Loader />}

    <main className="px-24">
      <h1 className="text-4xl mb-8">Subscription Plan Manager</h1>
      <div className="mb-6">
        <p className="text-lg text-gray-600">
          {currentSubscription 
            ? `Current Plan: ${currentSubscription.tag}` 
            : 'No current subscription found'
          }
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subscriptions.map((subscription) => {
          return (
            <div 
              key={subscription.code} 
              className="rounded-xl border border-slate-200 shadow-sm bg-white hover:shadow-md transition-shadow"
            >
                <h3 className="text-xl font-semibold text-slate-900 bg-violet-200 mb-1 rounded-t-lg p-6">{subscription.tag}</h3>
              <div className="mb-4 p-6">
                <p className="text-3xl font-bold text-slate-800 mb-1">
                  {subscription.currency} {subscription.price}
                </p>
                <p className="text-xs text-slate-500 tracking-wide">Code: {subscription.code}</p>
              </div>
            
            </div>
          );
        })}
      </div>

      <div className="text-center py-12">
        <button
          onClick={handleRetry}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Refresh
        </button>
      </div>
    </main>
    </>
  );
}