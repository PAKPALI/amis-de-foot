import Swal from 'sweetalert2';

export const ClubAlert = Swal.mixin({
    buttonsStyling: false,
    customClass: {
        popup: 'adf-alert',
        confirmButton: 'adf-alert-confirm',
        cancelButton: 'adf-alert-cancel',
    },
});
