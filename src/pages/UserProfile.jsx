import React, { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import {
    Box,
    Container,
    Typography,
    Avatar,
    TextField,
    Button,
    Paper,
    Grid,
    CircularProgress,
    IconButton,
    Input,
    Snackbar,
    Alert,
    LinearProgress
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// --- STYLED COMPONENTS ---
const ProfileAvatar = styled(Avatar)(({ theme }) => ({
    width: theme.spacing(16),
    height: theme.spacing(16),
    margin: 'auto',
    border: `4px solid ${theme.palette.background.paper}`,
    boxShadow: theme.shadows[3],
}));

const AvatarContainer = styled(Box)({
    position: 'relative',
    display: 'inline-block',
});

const UploadIconButton = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
        backgroundColor: theme.palette.primary.dark,
    },
}));

// --- COMPONENT ---
function UserProfile() {
    const { currentUser, setCurrentUser } = useAuth();
    
    // State for user data
    const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
    const [photoURL, setPhotoURL] = useState(currentUser?.photoURL || null);
    
    // State for UI
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    // --- HANDLERS ---

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // You can add file type/size validation here

        uploadProfilePicture(file);
    };

    const uploadProfilePicture = useCallback((file) => {
        setLoading(true);
        setUploadProgress(0);
        setError(null);

        const storageRef = ref(storage, `profile_pictures/${currentUser.uid}/${file.name}`);
        const uploadTask = uploadBytesResumable(storageRef, file);

        uploadTask.on(
            'state_changed',
            (snapshot) => {
                const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                setUploadProgress(progress);
            },
            (err) => {
                console.error("Upload error:", err);
                setError('Error al subir la imagen. Por favor, inténtalo de nuevo.');
                setLoading(false);
                setUploadProgress(0);
            },
            async () => {
                try {
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
                    setPhotoURL(downloadURL);
                    await updateUserData(currentUser.uid, { photoURL: downloadURL });
                    setSuccess('¡Foto de perfil actualizada!');
                } catch (err) {
                    console.error("Error getting download URL:", err);
                    setError('No se pudo obtener la URL de la imagen.');
                } finally {
                    setLoading(false);
                    setUploadProgress(0);
                }
            }
        );
    }, [currentUser]);

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        if (displayName.trim() === currentUser.displayName) return; // No changes

        setLoading(true);
        setError(null);

        try {
            await updateUserData(currentUser.uid, { displayName: displayName.trim() });
            setSuccess('¡Perfil actualizado correctamente!');
        } catch (err) {
            console.error("Profile update error:", err);
            setError('No se pudo actualizar el perfil.');
        } finally {
            setLoading(false);
        }
    };

    const updateUserData = async (uid, data) => {
        // 1. Update Firestore document
        const userDocRef = doc(db, 'users', uid);
        await updateDoc(userDocRef, data);

        // 2. Update Firebase Auth profile
        if (currentUser) {
          await updateProfile(currentUser, data);
        }
        
        // 3. Update local context state
        setCurrentUser(prevUser => ({...prevUser, ...data}));
    };

    // --- RENDER ---

    return (
        <Container maxWidth="md" sx={{ my: 5 }}>
            <Paper elevation={4} sx={{ p: { xs: 2, md: 4 }, borderRadius: '24px', overflow: 'hidden' }}>
                <Grid container spacing={4}>
                    {/* --- AVATAR SECTION --- */}
                    <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
                        <AvatarContainer>
                            <ProfileAvatar src={photoURL} />
                            <label htmlFor="icon-button-file">
                                <Input accept="image/*" id="icon-button-file" type="file" sx={{ display: 'none' }} onChange={handleFileChange} disabled={loading} />
                                <UploadIconButton color="primary" aria-label="upload picture" component="span" disabled={loading}>
                                    <PhotoCamera />
                                </UploadIconButton>
                            </label>
                        </AvatarContainer>
                        <Typography variant="h6" sx={{ mt: 2 }}>{currentUser?.displayName}</Typography>
                        <Typography variant="body2" color="text.secondary">{currentUser?.email}</Typography>
                        {uploadProgress > 0 && <LinearProgress variant="determinate" value={uploadProgress} sx={{mt: 2, borderRadius: '8px'}} />}
                    </Grid>

                    {/* --- FORM SECTION --- */}
                    <Grid item xs={12} md={8}>
                         <Typography component="h1" variant="h4" fontWeight="bold" gutterBottom>Editar Perfil</Typography>
                         <Typography color="text.secondary" sx={{mb: 3}}>Actualiza tu información personal.</Typography>
                        <Box component="form" onSubmit={handleProfileUpdate}>
                            <TextField
                                fullWidth
                                id="displayName"
                                label="Nombre para mostrar"
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                margin="normal"
                                variant="outlined"
                                required
                            />
                            <TextField
                                fullWidth
                                id="email"
                                label="Correo Electrónico"
                                value={currentUser?.email || ''}
                                margin="normal"
                                variant="outlined"
                                disabled // Email is not editable
                            />
                            <Button 
                                type="submit" 
                                variant="contained" 
                                size="large" 
                                sx={{ mt: 2, borderRadius: '12px' }} 
                                disabled={loading || !displayName.trim()}
                            >
                                {loading ? <CircularProgress size={24} color="inherit" /> : 'Guardar Cambios'}
                            </Button>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            {/* --- FEEDBACK SNACKBARS --- */}
            <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => setError(null)} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
            <Snackbar open={!!success} autoHideDuration={4000} onClose={() => setSuccess(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
                <Alert onClose={() => setSuccess(null)} severity="success" sx={{ width: '100%' }}>
                    {success}
                </Alert>
            </Snackbar>
        </Container>
    );
}

export default UserProfile;
