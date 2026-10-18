async function test() {
  const res1 = await fetch('https://backend-egd9xious-manishtarjan9798mk-3835s-projects.vercel.app/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test 1',
      phone: '1111111111',
      password: 'pass',
      role: 'CONSUMER'
    })
  });
  console.log('1:', await res1.text());

  const res2 = await fetch('https://backend-egd9xious-manishtarjan9798mk-3835s-projects.vercel.app/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Test 2',
      phone: '2222222222',
      password: 'pass',
      role: 'CONSUMER'
    })
  });
  console.log('2:', await res2.text());
}

test();
