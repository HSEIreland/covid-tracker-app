package com.covidtracker.hse;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import androidx.annotation.Nullable;
import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.rajivshah.safetynet.RNGoogleSafetyNetPackage;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript. This is used to schedule
     * rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "COVIDTracker";
    }

    public static class ActivityDelegate extends ReactActivityDelegate {
        private static final String NOTIFICATION = "exposureNotificationClicked";
        private Bundle mInitialProps = null;
        private final
        @Nullable
        Activity mActivity;

        public ActivityDelegate(Activity activity, String mainComponentName) {
            super(activity, mainComponentName);
            this.mActivity = activity;
        }

        @Override
        protected void onCreate(Bundle savedInstanceState) {
            Log.i("ActivityDelegate", "onCreate"); 

            Bundle bundle = mActivity.getIntent().getExtras();
            if (bundle != null && bundle.containsKey(NOTIFICATION)) {
                Log.i("ActivityDelegate", "notification: " + bundle.getBoolean(NOTIFICATION));
                mInitialProps = new Bundle();
                mInitialProps.putBoolean(NOTIFICATION, bundle.getBoolean(NOTIFICATION));
            }
            super.onCreate(null);
        }

        @Override
        protected Bundle getLaunchOptions() {
            return mInitialProps;
        }
    }

    @Override
    protected ReactActivityDelegate createReactActivityDelegate() {
        return new ActivityDelegate(this, getMainComponentName());
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        Log.i("MainActivity", "onCreate"); 
        super.onCreate(null);
    }
     
}
