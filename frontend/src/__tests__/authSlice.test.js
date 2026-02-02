import authReducer, { login, logout } from '../store/authSlice';

describe('authSlice', () => {
  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null
  };

  it('should return initial state', () => {
    expect(authReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should handle logout', () => {
    const previousState = {
      user: { id: '1', email: 'test@example.com' },
      token: 'token123',
      isAuthenticated: true,
      loading: false,
      error: null
    };

    expect(authReducer(previousState, logout())).toEqual({
      ...initialState,
      isAuthenticated: false
    });
  });

  it('should handle login pending', () => {
    const action = { type: login.pending.type };
    const state = authReducer(initialState, action);
    expect(state.loading).toBe(true);
    expect(state.error).toBeNull();
  });

  it('should handle login fulfilled', () => {
    const action = {
      type: login.fulfilled.type,
      payload: {
        user: { id: '1', email: 'test@example.com' },
        token: 'token123'
      }
    };
    const state = authReducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).toEqual(action.payload.user);
    expect(state.token).toBe('token123');
  });

  it('should handle login rejected', () => {
    const action = {
      type: login.rejected.type,
      payload: 'Login failed'
    };
    const state = authReducer(initialState, action);
    expect(state.loading).toBe(false);
    expect(state.error).toBe('Login failed');
  });
});
