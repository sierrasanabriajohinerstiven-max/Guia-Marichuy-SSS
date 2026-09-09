import { supabase, isSupabaseConfigured } from '../../../lib/supabaseClient';
import { Profile, ServiceResult } from '../../../types/db';

export async function signIn(email: string, password: string): Promise<ServiceResult<{ id: string; email: string }>> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return { data: null, error: 'Credenciales inválidas. Por favor verifica tu correo y contraseña.' };
      }
      return { data: null, error: error.message };
    }

    if (!data.user) {
      return { data: null, error: 'No se pudo obtener la sesión de usuario.' };
    }

    return {
      data: { id: data.user.id, email: data.user.email || '' },
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado al iniciar sesión.';
    return { data: null, error: message };
  }
}

export async function signUp(
  email: string,
  password: string,
  fullName: string,
  phone: string
): Promise<ServiceResult<{ id: string; email: string }>> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
      },
    });

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data.user) {
      return { data: null, error: 'No se pudo crear la cuenta de usuario.' };
    }

    const userId = data.user.id;

    // Actualización de teléfono en profiles (el trigger handle_new_user no guarda phone)
    if (phone && phone.trim()) {
      try {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ phone: phone.trim() })
          .eq('id', userId);

        if (profileError) {
          console.warn('Advertencia al guardar el teléfono:', profileError.message);
        }
      } catch (phoneErr) {
        console.warn('Fallo al actualizar teléfono:', phoneErr);
      }
    }

    return {
      data: { id: data.user.id, email: data.user.email || '' },
      error: null,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error inesperado al registrar cuenta.';
    return { data: null, error: message };
  }
}

export async function signOut(): Promise<ServiceResult<boolean>> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { data: null, error: error.message };
    }
    return { data: true, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al cerrar sesión.';
    return { data: null, error: message };
  }
}

export async function getProfile(userId: string): Promise<ServiceResult<Profile>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === '42501' || error.message.toLowerCase().includes('row-level security')) {
        return { data: null, error: 'No tienes permisos para consultar este perfil.' };
      }
      return { data: null, error: error.message };
    }

    return { data: data as Profile, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al consultar el perfil.';
    return { data: null, error: message };
  }
}

export async function updateProfile(
  userId: string,
  fullName: string,
  phone: string | null
): Promise<ServiceResult<Profile>> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: fullName.trim(),
        phone: phone ? phone.trim() : null,
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      if (error.code === '42501' || error.message.toLowerCase().includes('row-level security')) {
        return { data: null, error: 'No tienes permisos para realizar esta acción.' };
      }
      return { data: null, error: error.message };
    }

    return { data: data as Profile, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al actualizar el perfil.';
    return { data: null, error: message };
  }
}

export async function requestPasswordReset(email: string): Promise<ServiceResult<boolean>> {
  try {
    const redirectTo = window.location.origin;
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: true, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al solicitar restablecimiento de contraseña.';
    return { data: null, error: message };
  }
}

export async function updatePassword(newPassword: string): Promise<ServiceResult<boolean>> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { data: null, error: error.message };
    }

    return { data: true, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error al actualizar contraseña.';
    return { data: null, error: message };
  }
}
