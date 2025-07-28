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

  const upgradeSubscription = async (code: string) => {
    try {
      setLoading(true);
      setActionLoading(code);
      setError(null);
  
      const response = await fetch('http://localhost:3000/api/subscriptions/upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
  
      const data: UpgradeSubscriptionApiResponse = await response.json();
  
      if (data.status === 'success') {
        setCurrentSubscription(data.subscription);
        console.log('Upgrade successful:', data.message);
      } else {
        setError(`Upgrade failed: ${data.error}`);
        console.error('Upgrade failed:', data.error);
      }
    } catch (error) {
      setError('Upgrade failed. Please try again.');
      console.error('Upgrade failed:', error);
    } finally {
      setActionLoading(null);
      setLoading(false);
    }
  };


  const downgradeSubscription = async (code: string) => {
    try {
      setLoading(true);
      setActionLoading(code);
      setError(null);

      const response = await fetch('http://localhost:3000/api/subscriptions/downgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      
      const data: DowngradeSubscriptionApiResponse = await response.json();
      
      if (data.status === 'success') {
        setCurrentSubscription(data.subscription);
        alert(data.message);
      } else {
        alert(`Downgrade failed: ${data.error}`);
      }
    } catch (err) {
      alert('Downgrade failed. Please try again.');
    } finally {
      setActionLoading(null);
      setLoading(false);
    }
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
      <h1 className="text-4xl my-8">Subscription Plan Manager</h1>
      <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-2">Current Subscription</h2>

        <div className="text-lg rounded-lg border border-violet-400">
          {currentSubscription 
            ? (
              <div className='bg-violet-100 rounded-lg '>
              <h3 className="text-xl font-semibold text-slate-900 bg-violet-200 mb-1  rounded-t-lg p-6">{currentSubscription.tag}</h3>
              <div className="p-6 rounded-b-lg">
                <p className="text-3xl font-bold text-slate-800 mb-1">
                  {currentSubscription.currency} {currentSubscription.price}
                </p>
                <p className="text-xs text-slate-500">Code: {currentSubscription.code}</p>
              </div>
              </div>
            )
            : 'No current subscription found'
          }
        </div>
      </div>

      <h2 className="text-2xl font-semibold mb-2">Available Plans</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {subscriptions.map((subscription) => {
          const isLoading = actionLoading === subscription.code;
          return (
            
            <div 
              key={subscription.code} 
              className={`rounded-xl border ${currentSubscription 
              ? (currentSubscription.tag == subscription.tag || currentSubscription.tag == null ? 'border-violet-200' : 'border-slate-200') : null} }shadow-sm bg-white hover:shadow-md transition-shadow`}
              
            >
                <h3 className="text-xl font-semibold text-slate-900 bg-violet-200 mb-1 rounded-t-lg p-6">{subscription.tag}</h3>
              <div className="mb-2 p-6">
                <p className="text-3xl font-bold text-slate-800 mb-1">
                  {subscription.currency} {subscription.price}
                </p>
                <p className="text-xs text-slate-500 tracking-wide">Code: {subscription.code}</p>
              </div>
            
              <div className="px-6 pb-6">
                  <span className="text-blue-600 bg-blue-100 border border-blue-600 py-2 px-4 rounded-full font-semibold text-sm">
                    Current Plan
                  </span>
                
                  <button
                    onClick={() => upgradeSubscription(subscription.code)}
                    disabled={isLoading}
                    className="text-green-600 bg-green-100 border border-green-600 py-2 px-4 rounded-full font-semibold text-sm hover:text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Upgrading...' : 'Upgrade'}
                  </button>
                
                  <button
                    onClick={() => downgradeSubscription(subscription.code)}
                    disabled={isLoading}
                    className="text-red-600 bg-red-100 border border-red-600 py-2 px-4 rounded-full font-semibold text-sm hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? 'Downgrading...' : 'Downgrade'}
                  </button>
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