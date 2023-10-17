window.addEventListener('message', function(event) {
  if (event.data?.target === 'keystone3') {
    console.log('Received message:', event.data);

    const encodedData = btoa(JSON.stringify(event.data));

    event.source?.postMessage(encodedData, event.origin as any);
  }
});