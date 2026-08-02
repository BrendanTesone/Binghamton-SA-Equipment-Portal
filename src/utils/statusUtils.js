export const getStatusColor = (status) => {
    switch (status) {
        case 'Available':
        case 'Approved':
            return 'success';
        case 'Picked Up':
        case 'Pending Approval':
            return 'warning';
        case 'In Office - Unavailable':
        case 'Denied':
            return 'error';
        default:
            return 'default';
    }
};
